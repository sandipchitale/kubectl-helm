# Kubectl plugin - helm

This ```kubectl``` plugin will run standard ```helm``` commands except when custom commands supported by this plugin are invoked.

## Usage

```
kubectl helm list
kubectl helm history RELEASENAME
```

# Custom helm commands

```
kubectl helm get templates RELEASENAME [--revision n]
```

## Building

```
npm install
npm run pkg
```

## Installation of the plugin

For now simply add the bin folder to you PATH. And then ```kubectl``` will find the ```bin\kubectl-helm[.exe]``` file when you run ```kubectl helm ...```.
