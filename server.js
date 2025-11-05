#!/usr/bin/env node
import pkg from "stremio-addon-sdk";
const { serveHTTP } = pkg;

import addonInterface from "./addon/addon.js";

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

startServer();
