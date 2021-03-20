# Wahoo

![Wahoo Logo](./images/wahoo-logo.png)

[Reconciler Test](https://github.com/knative-sandbox/reconciler-test) Results Viewer.

## Usage

TBD

## Running Locally

```shell
KO_DATA_PATH=./kodata go run .
```

## Running on Kubernetes

### From Release v0.0.1 (TBD)

To install into your default namespace

```shell
kubectl apply -f https://github.com/n3wscott/wahoo/releases/download/v0.0.1/release.yaml
```

This artifact will work on the following linux architectures: amd64, arm, arm64,
ppc64le, s390x

### From Source

```shell
ko apply -f config/wahoo.yaml
```

### Thanks

Wahoo image from [mattesseafood.com](http://www.mattesseafood.com/wahoo/)