// api/index.js
const app = require("../src/app"); // bring in your express app
const serverless = require("serverless-http");

// Wrap the app once
const handler = serverless(app);

// Export as default Vercel function handler
module.exports = handler;
