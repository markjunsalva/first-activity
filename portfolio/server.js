const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

console.log("Project root is:", __dirname);

// ✅ Always serve static files (CSS, assets, uploads)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// ✅ Handle uploads
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.send("No file uploaded!");

  const target = req.body.target || "profile";
  const newPath = "/uploads/" + req.file.filename;

  const configPath = path.join(__dirname, "public/current.json");
  let cfg = {};
  if (fs.existsSync(configPath)) {
    cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  cfg[target] = newPath;
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

  res.redirect("/");
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log("Looking for static files in:", path.join(__dirname, "public"));
});
