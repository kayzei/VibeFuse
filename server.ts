import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vibefuse.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    tier TEXT DEFAULT 'free'
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    artist TEXT,
    album TEXT,
    genre TEXT,
    duration INTEGER,
    cover_url TEXT,
    audio_url TEXT,
    is_local BOOLEAN DEFAULT 0,
    plays INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT,
    amount REAL,
    sender_name TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    owner_id INTEGER,
    is_public BOOLEAN DEFAULT 1,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );
`);

// Seed some mock data if empty
const trackCount = db.prepare("SELECT COUNT(*) as count FROM tracks").get() as { count: number };
if (trackCount.count === 0) {
  const insertTrack = db.prepare("INSERT INTO tracks (title, artist, album, genre, duration, cover_url, audio_url, is_local) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  
  // Zambian Artists Mock Data
  insertTrack.run("Mother Tongue", "Slapdee", "Mother Tongue", "Hip Hop", 210, "https://picsum.photos/seed/slapdee/400/400", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 1);
  insertTrack.run("Beautiful Night", "Macky 2", "Olijaba", "Afrobeats", 195, "https://picsum.photos/seed/macky2/400/400", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", 1);
  insertTrack.run("Coordinate", "Chef 187", "Broke Nolunkumbwa", "Hip Hop", 225, "https://picsum.photos/seed/chef187/400/400", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", 1);
  insertTrack.run("Siliya", "Cleo Ice Queen", "Leaders of the New School", "Hip Hop", 180, "https://picsum.photos/seed/cleo/400/400", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", 1);
  insertTrack.run("Midnight City", "M83", "Hurry Up, We're Dreaming", "Synth-pop", 243, "https://picsum.photos/seed/m83/400/400", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", 0);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/tracks", (req, res) => {
    const tracks = db.prepare("SELECT * FROM tracks").all();
    res.json(tracks);
  });

  app.get("/api/tracks/local", (req, res) => {
    const tracks = db.prepare("SELECT * FROM tracks WHERE is_local = 1").all();
    res.json(tracks);
  });

  app.get("/api/search", (req, res) => {
    const q = req.query.q;
    const tracks = db.prepare("SELECT * FROM tracks WHERE title LIKE ? OR artist LIKE ?").all(`%${q}%`, `%${q}%`);
    res.json(tracks);
  });

  app.post("/api/tracks/:id/play", (req, res) => {
    const { id } = req.params;
    db.prepare("UPDATE tracks SET plays = plays + 1 WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/charts/lusaka", (req, res) => {
    const tracks = db.prepare("SELECT * FROM tracks ORDER BY plays DESC LIMIT 20").all();
    res.json(tracks);
  });

  app.post("/api/artists/tip", (req, res) => {
    const { artist_name, amount, sender_name, message } = req.body;
    if (!artist_name || !amount) return res.status(400).json({ error: "Missing data" });
    
    db.prepare("INSERT INTO tips (artist_name, amount, sender_name, message) VALUES (?, ?, ?, ?)").run(
      artist_name, amount, sender_name || "Anonymous", message || ""
    );
    res.json({ success: true });
  });

  app.get("/api/artists/:name/stats", (req, res) => {
    const { name } = req.params;
    const totalPlays = db.prepare("SELECT SUM(plays) as total FROM tracks WHERE artist = ?").get(name) as { total: number };
    const tips = db.prepare("SELECT * FROM tips WHERE artist_name = ? ORDER BY timestamp DESC").all(name);
    const totalTips = db.prepare("SELECT SUM(amount) as total FROM tips WHERE artist_name = ?").get(name) as { total: number };
    
    res.json({
      plays: totalPlays.total || 0,
      tips: tips,
      totalTips: totalTips.total || 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VibeFuse server running on http://localhost:${PORT}`);
  });
}

startServer();
