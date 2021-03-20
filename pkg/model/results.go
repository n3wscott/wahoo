package model

type Results struct {
	Run         string       `json:"run"`
	Environment *Environment `json:"environment"`
	Tests       []Test       `json:"tests"`
}

type Environment struct {
	Namespace        string `json:"namespace"`
	FeatureState     string `json:"featureState"`
	RequirementLevel string `json:"requirementLevel"`

	Created string `json:"created"`
	Deleted string `json:"deleted"`
}

type Test struct {
	Name  string `json:"name"`
	Steps []Step `json:"step"`

	Passed  bool `json:"passed"`
	Skipped bool `json:"skipped"`
	Failed  bool `json:"failed"`

	Started string `json:"started"`
	Ended   string `json:"ended"`
}

type Step struct {
	Name   string `json:"name"`
	Level  string `json:"level"`
	Timing string `json:"timing"`

	Passed  bool `json:"passed"`
	Skipped bool `json:"skipped"`
	Failed  bool `json:"failed"`

	Started string `json:"started"`
	Ended   string `json:"ended"`
}
