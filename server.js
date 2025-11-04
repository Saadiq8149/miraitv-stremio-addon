#!/usr/bin/env node
import pkg from "stremio-addon-sdk";
const { serveHTTP } = pkg;

import addonInterface from "./addon/addon.js";
import { closeBrowser } from "./addon/browser.js";

const PORT = process.env.PORT || 64599;

function startServer() {
  try {
    serveHTTP(addonInterface, { port: PORT });
    console.log(`MiraiTV addon running on port ${PORT}`);
  } catch (error) {
    console.error("Server error:", error);
    console.log("Restarting server in 3 seconds...");
    setTimeout(startServer, 3000);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  console.log("Restarting server in 1 second...");
  setTimeout(startServer, 1000);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  console.log("Restarting server in 1 seconds...");
  setTimeout(startServer, 1000);
});

process.on("SIGINT", async () => {
  console.log("Closing browser...");
  await closeBrowser();
  process.exit(0);
});

// Start the server
startServer();
