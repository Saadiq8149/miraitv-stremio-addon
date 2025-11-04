import pkg from "stremio-addon-sdk";
const { addonBuilder } = pkg;

import { manifest } from "./manifest.js";
import { streamHandler, subtitlesHandler } from "./handlers.js";

const builder = new addonBuilder(manifest);
builder.defineStreamHandler(streamHandler);
builder.defineSubtitlesHandler(subtitlesHandler);

export default builder.getInterface();
