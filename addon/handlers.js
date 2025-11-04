import { resolveObjectURL } from "buffer";
import { initBrowser } from "./browser.js";

const SOURCE_BASE_URL = "https://111movies.com";

async function isJsonResponse(response) {
  try {
    const data = await response.json();
    return true;
  } catch (e) {
    return false;
  }
}

async function isRelevantResponse(response, url) {
  if (response.url() == url) {
    return false;
  }
  if (!String(response.url()).startsWith(SOURCE_BASE_URL)) {
    return false;
  }
  for (var type of ["mjs", "js", "css", "png", "jpg", "jpeg", "gif", "svg"]) {
    if (String(response.url()).endsWith(type)) {
      return false;
    }
  }
  if (await isJsonResponse(response)) {
    return true;
  }
  return false;
}

export async function streamHandler({ type, id }) {
  console.log(`Request for streams: ${type} ${id}`);
  const { context } = await initBrowser();

  var url;

  if (type === "movie") {
    url = `${SOURCE_BASE_URL}/movie/${id}`;
  } else if (type === "series") {
    const [seriesId, season, episode] = id.split(":");
    url = `${SOURCE_BASE_URL}/tv/${seriesId}/${season}/${episode}`;
  } else {
    return { streams: [] };
  }

  var responses = [];

  const page = await context.newPage();

  page.on("response", async (response) => {
    if (await isRelevantResponse(response, url)) {
      responses.push(response);
    }
  });

  await page.goto(url);
  await page.waitForLoadState("networkidle");

  var streams = [];

  if (responses.length == 2) {
    const stream = await responses.pop().json();
    var subtitles = [];

    for (var track of stream["tracks"]) {
      subtitles.push({
        id: track["lablel"],
        url: track["file"],
        lang: track["label"],
      });
    }

    streams.push({
      title: "111Movies Source",
      url: stream["url"],
      subtitles: subtitles,
    });
  }

  await page.close();
  console.log(streams);
  return { streams };
}

export async function subtitlesHandler({ type, id }) {
  console.log(`Request for subtitles: ${type} ${id}`);
  return { subtitles: [] };
}
