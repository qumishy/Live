const express = require("express");
const app = express();

const PLAYLISTS = {
  news: "https://iptv-org.github.io/iptv/categories/news.m3u",
  sports: "https://iptv-org.github.io/iptv/categories/sports.m3u",
  arabic: "https://iptv-org.github.io/iptv/languages/ara.m3u",
  all: "https://iptv-org.github.io/iptv/index.m3u"
};

const TEST_CHANNELS = [
  {
    id: "bigbuck",
    name: "Big Buck Bunny",
    category: "Test",
    logo: "🐰",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    badge: "TEST"
  },
  {
    id: "tears",
    name: "Tears of Steel",
    category: "Test",
    logo: "🎬",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    badge: "TEST"
  },
  {
    id: "nasa",
    name: "NASA TV",
    category: "Science",
    logo: "🚀",
    url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master_2000.m3u8",
    badge: "LIVE"
  }
];

const CACHE_TTL_MS = 10 * 60 * 1000;
const playlistCache = new Map();

function extractAttr(line, attr) {
  const m = line.match(new RegExp(`${attr}="([^"]*)"`, "i"));
  return m ? m[1].trim() : "";
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF")) {
      const name = (line.split(",").pop() || "").trim() || "Unknown Channel";
      const logo = extractAttr(line, "tvg-logo") || "📺";
      const category = extractAttr(line, "group-title") || "General";

      let url = "";
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();

        if (!next) continue;
        if (next.startsWith("#EXTINF")) break;
        if (next.startsWith("#")) continue;

        if (/^https?:\/\//i.test(next)) {
          url = next;
          i = j;
          break;
        }
      }

      if (url && /^https?:\/\//i.test(url)) {
        const safeId = slugify(name) || `channel-${channels.length + 1}`;
        channels.push({
          id: `${safeId}-${channels.length + 1}`,
          name,
          category,
          logo,
          url,
          badge: "LIVE"
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
    playlists: Object.keys(PLAYLISTS),
    endpoints: [
      "/channels?cat=news",
      "/channels?cat=sports",
      "/channels?cat=arabic",
      "/channels?cat=all",
      "/test-channels"
    ]
  });
});

app.get("/test-channels", (req, res) => {
  res.json(TEST_CHANNELS);
});

app.get("/channels", async (req, res) => {
  const requestedCat = String(req.query.cat || "news").toLowerCase();
  const cat = Object.prototype.hasOwnProperty.call(PLAYLISTS, requestedCat) ? requestedCat : "news";
  const cacheKey = cat;
  const cached = playlistCache.get(cacheKey);

  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const response = await fetch(PLAYLISTS[cat]);
    if (!response.ok) {
      throw new Error(`Playlist request failed: ${response.status}`);
    }
    const text = await response.text();
    const channels = parseM3U(text).filter((c) => c && /^https?:\/\//i.test(c.url || ""));

    playlistCache.set(cacheKey, { ts: Date.now(), data: channels });
    res.json(channels);
  } catch (e) {
    if (cached && Array.isArray(cached.data)) {
      return res.json(cached.data);
    }
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
