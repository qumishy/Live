const express = require("express");
const app = express();

const PLAYLIST_URL = "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";

function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF")) {
      const name = line.split(",").pop().trim();

      let url = "";
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();

        if (!next) continue;
        if (next.startsWith("#EXTINF")) break;
        if (next.startsWith("#")) continue;

        if (next.startsWith("http")) {
          url = next;
          break;
        }
      }

      if (url) {
        channels.push({
          id: channels.length + 1,
          name,
          url
        });
      }
    }
  }

  return channels;
}

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Live API is running",
    source: PLAYLIST_URL
  });
});

app.get("/channels", async (req, res) => {
  try {
    const response = await fetch(PLAYLIST_URL);
    const text = await response.text();
    const channels = parseM3U(text);
    res.json(channels);
  } catch (e) {
    res.status(500).json({
      error: "Failed to load playlist",
      details: e.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
