package controller

import (
	"log"
	"path/filepath"
	"strings"
	"time"

	cloudevents "github.com/cloudevents/sdk-go/v2"
	"github.com/n3wscott/wahoo/pkg/model"
)

const (
	EnvironmentType      = "dev.knative.rekt.environment.v1"
	NamespaceCreatedType = "dev.knative.rekt.namespace.created.v1"
	NamespaceDeletedType = "dev.knative.rekt.namespace.deleted.v1"
	TestStartedType      = "dev.knative.rekt.test.started.v1"
	TestFinishedType     = "dev.knative.rekt.test.finished.v1"
	StepsPlannedType     = "dev.knative.rekt.steps.planned.v1"
	StepStartedType      = "dev.knative.rekt.step.started.v1"
	StepFinishedType     = "dev.knative.rekt.step.finished.v1"
	TestSetStartedType   = "dev.knative.rekt.testset.started.v1"
	TestSetFinishedType  = "dev.knative.rekt.testset.finished.v1"
	FinishedType         = "dev.knative.rekt.finished.v1"
	ExceptionType        = "dev.knative.rekt.exception.v1"
)

type KeyData struct {
	ID    string `json:"id"`
	Added string `json:"added"`
}

func (c *Controller) keyFromEvent(event cloudevents.Event) KeyData {
	_, id := filepath.Split(event.Source())

	key := KeyData{
		ID:    id,
		Added: event.Time().UTC().Format(time.RFC3339),
	}

	found := false
	for _, sk := range c.store.Keys() {
		k := sk.(KeyData)
		if k.ID == id {
			found = true
			key = k
			break
		}
	}

	// Special case the start of the env.
	if found && event.Type() == EnvironmentType {
		newKey := KeyData{
			ID:    id,
			Added: event.Time().UTC().Format(time.RFC3339),
		}
		if v := c.store.Get(key); v != nil {
			c.store.Delete(key)
			c.store.Set(newKey, v)
		}
		return newKey
	}

	return key
}

func testNameFromStepName(stepName string) string {
	parts := strings.Split(stepName, "/")
	if len(parts) > 2 {
		return parts[0]
		//return strings.Join(parts[:2], "/")
	}
	return stepName
}

func (c *Controller) CeHandler(event cloudevents.Event) {

	key := c.keyFromEvent(event)

	asResults := func(value interface{}, found bool) *model.Results {
		results, ok := value.(*model.Results)
		if !ok || !found {
			results = new(model.Results)
			results.Run = key.ID
		}
		return results
	}

	switch event.Type() {
	case EnvironmentType:
		var env model.Environment
		if err := event.DataAs(&env); err != nil {
			log.Println("failed to parse data from event: ?????? ", event.String())
			return
		}
		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			results.Started = event.Time().UTC().Format(time.RFC3339)
			if results.Environment != nil {
				env.Created = results.Environment.Created
				env.Deleted = results.Environment.Deleted
			}
			results.Environment = &env
			return results
		})

	case NamespaceCreatedType:
		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			if results.Environment == nil {
				results.Environment = new(model.Environment)
			}
			results.Environment.Created = event.Time().UTC().Format(time.RFC3339)
			return results
		})

	case NamespaceDeletedType:
		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			if results.Environment == nil {
				results.Environment = new(model.Environment)
			}
			results.Environment.Deleted = event.Time().UTC().Format(time.RFC3339)
			return results
		})

	case TestStartedType:
		var started TestType
		if err := event.DataAs(&started); err != nil {
			log.Println("failed to parse data from event: ?????? ", event.String())
			return
		}

		testName := started.Feature
		if len(testName) == 0 {
			_ = event.ExtensionAs("testparent", &testName)
		}

		test := model.Test{
			Name:    testName,
			Started: event.Time().UTC().Format(time.RFC3339),
		}
		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			exists := false
			for i, t := range results.Tests {
				if t.Name == test.Name {
					exists = true
					results.Tests[i].Started = test.Started
					break
				}
			}
			if !exists {
				results.Tests = append(results.Tests, test)
			}
			return results
		})

	case TestFinishedType:
		var finished TestType
		if err := event.DataAs(&finished); err != nil {
			log.Println("failed to parse data from event: ?????? ", event.String())
			return
		}
		testName := finished.Feature
		if len(testName) == 0 {
			_ = event.ExtensionAs("testparent", &testName)
		}

		test := model.Test{
			Name:    testName,
			Passed:  finished.Passed,
			Skipped: finished.Skipped,
			Failed:  finished.Failed,
			Ended:   event.Time().UTC().Format(time.RFC3339),
		}
		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			exists := false
			for i, t := range results.Tests {
				if t.Name == test.Name {
					exists = true
					results.Tests[i].Passed = test.Passed
					results.Tests[i].Skipped = test.Skipped
					results.Tests[i].Failed = test.Failed
					results.Tests[i].Ended = test.Ended
					break
				}
			}
			if !exists {
				results.Tests = append(results.Tests, test)
			}
			return results
		})
	case StepsPlannedType:
		var planned PlannedType
		if err := event.DataAs(&planned); err != nil {
			log.Println("failed to parse data from event: ?????? ", event.String())
			return
		}

		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			testExists := false

			testName := planned.Feature
			if len(testName) == 0 {
				_ = event.ExtensionAs("testparent", &testName)
			}

			order := []string{"Setup", "Requirement", "Assert", "Teardown"}

			for i, t := range results.Tests {
				if t.Name == testName {
					testExists = true

					for _, timing := range order {
						for _, stepName := range planned.Steps[timing] {
							stepFound := false
							for _, s := range results.Tests[i].Steps {
								if s.Name == stepName {
									stepFound = true
									break
								}
							}
							if !stepFound {
								results.Tests[i].Steps = append(results.Tests[i].Steps, model.Step{
									Name:   stepName,
									Timing: timing,
								})
							}
						}
					}
				}
			}
			if !testExists {
				var steps []model.Step
				for _, timing := range order {
					for _, stepName := range planned.Steps[timing] {
						steps = append(steps, model.Step{
							Name:   stepName,
							Timing: timing,
						})
					}
				}
				results.Tests = append(results.Tests, model.Test{
					Name:  testName,
					Steps: steps,
				})
			}
			return results
		})

	case StepStartedType:
		var started StepType
		if err := event.DataAs(&started); err != nil {
			log.Println("failed to parse data from event: ?????? ", event.String())
			return
		}
		step := model.Step{
			Name:    started.StepName,
			Level:   started.StepLevel,
			Timing:  started.StepTiming,
			Started: event.Time().UTC().Format(time.RFC3339),
		}

		testName := started.Feature
		if len(testName) == 0 {
			_ = event.ExtensionAs("testparent", &testName)
		}

		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			testExists := false
			for i, t := range results.Tests {
				if t.Name == testName {
					testExists = true
					stepFound := false
					for j, s := range results.Tests[i].Steps {
						if s.Name == step.Name {
							stepFound = true
							results.Tests[i].Steps[j].Level = step.Level
							results.Tests[i].Steps[j].Timing = step.Timing
							results.Tests[i].Steps[j].Started = step.Started
							break
						}
					}
					if !stepFound {
						results.Tests[i].Steps = append(results.Tests[i].Steps, step)
					}
					break
				}
			}
			if !testExists {
				results.Tests = append(results.Tests, model.Test{
					Name: testName,
					Steps: []model.Step{
						step,
					},
				})
			}
			return results
		})

	case StepFinishedType:
		var started StepType
		if err := event.DataAs(&started); err != nil {
			log.Println("failed to parse data from event: ?????? ", event.String())
			return
		}
		step := model.Step{
			Name:    started.StepName,
			Passed:  started.Passed,
			Skipped: started.Skipped,
			Failed:  started.Failed,
			Ended:   event.Time().UTC().Format(time.RFC3339),
		}
		//testName := testNameFromStepName(started.TestName)
		testName := started.Feature
		if len(testName) == 0 {
			_ = event.ExtensionAs("testparent", &testName)
		}

		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			testExists := false
			for i, t := range results.Tests {
				if t.Name == testName {
					testExists = true
					stepFound := false
					for j, s := range results.Tests[i].Steps {
						if s.Name == step.Name {
							stepFound = true
							results.Tests[i].Steps[j].Passed = step.Passed
							results.Tests[i].Steps[j].Skipped = step.Skipped
							results.Tests[i].Steps[j].Failed = step.Failed
							results.Tests[i].Steps[j].Ended = step.Ended
							break
						}
					}
					if !stepFound {
						results.Tests[i].Steps = append(results.Tests[i].Steps, step)
					}
					break
				}
			}
			if !testExists {
				results.Tests = append(results.Tests, model.Test{
					Name: testName,
					Steps: []model.Step{
						step,
					},
				})
			}
			return results
		})

	case TestSetStartedType:
		// noop for now.
	case TestSetFinishedType:
		// noop for now.

	case FinishedType:
		c.store.Update(key, func(value interface{}, found bool) interface{} {
			results := asResults(value, found)
			results.Finished = event.Time().UTC().Format(time.RFC3339)
			return results
		})

	case ExceptionType:
		// TODO

	default:
		log.Println("unknown event type:", event.Type())
	}

	c.store.Get(key)

	return
}

type TestType struct {
	TestName string `json:"testName"`
	Feature  string `json:"feature"`
	Passed   bool   `json:"passed"`
	Skipped  bool   `json:"skipped"`
	Failed   bool   `json:"failed"`
}

type PlannedType struct {
	TestName string              `json:"testName"`
	Feature  string              `json:"feature"`
	Steps    map[string][]string `json:"steps"`
}

type StepType struct {
	TestName   string `json:"testName"`
	Feature    string `json:"feature"`
	StepName   string `json:"stepName"`
	StepLevel  string `json:"stepLevel"`
	StepTiming string `json:"stepTiming"`
	Passed     bool   `json:"passed"`
	Skipped    bool   `json:"skipped"`
	Failed     bool   `json:"failed"`
}

/*

'{"failed":false,"feature":"Broker","passed":true,"skipped":false,"stepLevel":"SHOULD","stepName":"Conformance
  The class of a Broker object SHOULD be immutable.","stepTiming":"Assert","testName":"TestBrokerConformance/Knative_Broker_Specification_-_Control_Plane/Assert/[Stable/SHOULD]Conformance_The_class_of_a_Broker_object_SHOULD_be_immutable."}'
---
*/
