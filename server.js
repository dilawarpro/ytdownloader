const express = require("express");
const cors = require("cors");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// Serve static files from 'public' folder (if needed)
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html from the root directory
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Download route for YouTube videos
app.get("/download", async (req, res) => {
    try {
        const url = req.query.url;
        const format = req.query.format;
        
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }
        
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, ""); // Clean filename
        const filename = `${title}.${format}`;
        
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/octet-stream");

        const stream = ytdl(url, { filter: format === "mp3" ? "audioonly" : "videoandaudio" });
        stream.pipe(res);

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ error: "Failed to download video." });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
