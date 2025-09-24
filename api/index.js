const app = require("../src/app");
const serverless = require("serverless-http");

// Export a serverless handler
module.exports = serverless(app);
