import { chromium } from "playwright";

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

async function processStreamResponse(response) {
  try {
    const data = await response.json();
    if (data && data.url && data.tracks) {
      return {
        url: data.url,
        tracks: data.tracks,
      };
    }
  } catch (error) {
    console.log("Error parsing response:", error.message);
  }
  return null;
}

export async function streamHandler({ type, id }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
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
  const viewport = page.viewportSize();
  await page.mouse.click(viewport.width / 2, viewport.height / 2);

  try {
    await page.waitForSelector("button.MuiBox-root.css-9sg0ji", {
      timeout: 5000,
    });
    await page.click("button.MuiBox-root.css-9sg0ji");
  } catch (error) {
    console.log("Menu button not found or clickable");
  }

  try {
    const ulSelector = "ul.MuiList-root.MuiList-padding.css-1wduhak > li";
    await page.waitForSelector(ulSelector, { timeout: 5000 });

    const items = page.locator(ulSelector);
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      await items.nth(i).click();
      await page.waitForTimeout(1500);
    }
  } catch (error) {
    console.log("Menu items not found");
  }

  var streams = [];
  const sourceNames = await responses[0].json();

  for (let i = 1; i < responses.length; i++) {
    const streamData = await processStreamResponse(responses[i]);

    if (streamData) {
      var subtitles = [];

      for (let j = 0; j < streamData.tracks.length; j++) {
        const track = streamData.tracks[j];
        subtitles.push({
          id: j,
          url: track.file,
          lang: track.label,
        });
      }

      streams.push({
        title: `Source ${sourceNames[i - 1]?.name || i}`,
        url: streamData.url,
        subtitles: subtitles,
      });
    }
  }

  if (streams.length === 0 && responses.length >= 2) {
    const streamData = await processStreamResponse(
      responses[responses.length - 1]
    );

    if (streamData) {
      var subtitles = [];

      for (let i = 0; i < streamData.tracks.length; i++) {
        const track = streamData.tracks[i];
        subtitles.push({
          id: i,
          url: track.file,
          lang: track.label,
        });
      }

      streams.push({
        title: "111Movies Source",
        url: streamData.url,
        subtitles: subtitles,
      });
    }
  }

  await page.close();
  await context.close();
  await browser.close();
  return { streams };
}

export async function subtitlesHandler({ type, id }) {
  return { subtitles: [] };
}
