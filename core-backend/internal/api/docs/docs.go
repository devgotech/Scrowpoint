package docs

import (
	_ "embed"
	"net/http"
)

//go:embed openapi.yaml
var OpenAPIYAML []byte

//go:embed openapi.json
var OpenAPIJSON []byte

const swaggerUIHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scrowpoint Core Backend — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        tryItOutEnabled: true,
      });
    };
  </script>
</body>
</html>`

// Handler serves interactive Swagger UI at /docs and the OpenAPI document.
func Handler(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/docs", "/docs/":
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(swaggerUIHTML))
	case "/openapi.json", "/docs/openapi.json":
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(OpenAPIJSON)
	case "/openapi.yaml", "/docs/openapi.yaml":
		w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(OpenAPIYAML)
	default:
		http.NotFound(w, r)
	}
}

// IsDocsPath reports whether the request should be handled by the Swagger docs handler.
func IsDocsPath(path string) bool {
	switch path {
	case "/docs", "/docs/",
		"/openapi.yaml", "/openapi.json",
		"/docs/openapi.yaml", "/docs/openapi.json":
		return true
	default:
		return false
	}
}
