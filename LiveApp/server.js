const express = require("express");
const app = express();

const PLAYLIST_URL =
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";

function parseM3U(text) {
  const lines = text.split("\n");
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF")) {
      const name = line.split(",").pop().trim();
      const url = lines[i + 1]?.trim();

      if (url && url.startsWith("http")) {
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
    endpoints: ["/channels"]
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
