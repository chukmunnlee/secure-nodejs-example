# Build bundle
```
	opa bundle -r r0 policies/
```
The command will produce a file call `bundle.tar.gz`

# Create `time-cm` configmap
```
	kubectl create cm time-cm --from-file bundle.tar.tz 
```

# Deploy demo application
```
	kubectl apply -f deploy.yaml
```

