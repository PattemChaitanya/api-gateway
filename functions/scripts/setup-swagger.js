/**
 * Setup Swagger Documentation
 * This script sets up Swagger documentation for both local development and Netlify deployment
 */

const fs = require("fs");
const path = require("path");
const swaggerConfig = require("../app/config/swagger");

// Directory paths
const publicDir = path.join(__dirname, "../public");
const swaggerJsonPath = path.join(publicDir, "swagger.json");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.warn("Created public directory");
}

// Write Swagger JSON to public directory for static serving
fs.writeFileSync(swaggerJsonPath, JSON.stringify(swaggerConfig, null, 2));
console.warn("Generated swagger.json for static hosting");

// Check if Swagger custom CSS exists, if not create a basic one
const customCssPath = path.join(publicDir, "swagger-custom.css");
if (!fs.existsSync(customCssPath)) {
  const basicCss = `
/* Custom Swagger UI Styles */
.swagger-ui .topbar {
  background-color: #1a237e;
}

.swagger-ui .info .title {
  color: #1a237e;
}

.swagger-ui .btn.execute {
  background-color: #2e7d32;
}

.swagger-ui .btn.execute:hover {
  background-color: #1b5e20;
}

.swagger-ui .opblock.opblock-get .opblock-summary {
  border-color: #1976d2;
}

.swagger-ui .opblock.opblock-get .opblock-summary-method {
  background-color: #1976d2;
}

.swagger-ui .opblock.opblock-post .opblock-summary-method {
  background-color: #2e7d32;
}

.swagger-ui .opblock.opblock-put .opblock-summary-method {
  background-color: #ff8f00;
}

.swagger-ui .opblock.opblock-delete .opblock-summary-method {
  background-color: #d32f2f;
}
`;
  fs.writeFileSync(customCssPath, basicCss);
  console.warn("Created swagger-custom.css template");
}

console.warn("Swagger setup completed successfully!");
