package model

type Results struct {
	Run string `json:"run"`
	Environment Environment `json:"environment"`
	Tests []Test `json:"tests"`
}

type Environment struct {
	Namespace string `json:"namespace"`
	FeatureState string `json:"featureState"`
	RequirementLevel string `json:"requirementLevel"`
}

type Test struct {
	Name string `json:"name"`
	Features []Feature `json:"features"`
}

type Feature struct {
	Name string `json:"name"`
	Steps []Step `json:"step"`
}

type Step struct {
	Name string `json:"name"`
	Level string `json:"level"`
}