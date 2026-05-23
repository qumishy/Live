const express = require("express");
const app = express();

const channels = [
  {
    id: 1,
    name: "Test Stream",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 2,
    name: "Big Buck Bunny",
    url: "https://test-streams.mux.dev/bbb-360p.m3u8"
  }
];

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Live API is running",
    channels
  });
});

app.get("/channels", (req, res) => {
  res.json(channels);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
