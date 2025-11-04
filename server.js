#!/usr/bin/env node
import pkg from "stremio-addon-sdk";
const { serveHTTP } = pkg;

import addonInterface from "./addon/addon.js";
import { closeBrowser } from "./addon/browser.js";

const PORT = process.env.PORT || 64599;

serveHTTP(addonInterface, { port: PORT });
console.log(`MiraiTV addon running on port ${PORT}`);

process.on("SIGINT", async () => {
  console.log("Closing browser...");
  await closeBrowser();
  process.exit(0);
});
