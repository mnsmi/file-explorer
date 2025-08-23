const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: "geheimesleutel",
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });
const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ msg: "Ongeldig" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ msg: "Ongeldig" });

  req.session.user = { username: user.username, role: user.role };
  res.json({ msg: "OK", role: user.role });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ msg: "Uitgelogd" }));
});

app.get("/files", (req, res) => {
  if (!req.session.user) return res.status(401).end();
  fs.readdir("uploads", (err, files) => {
    res.json({ files, role: req.session.user.role });
  });
});

app.get("/download/:file", (req, res) => {
  if (!req.session.user) return res.status(401).end();
  res.download(path.join(__dirname, "uploads", req.params.file));
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") return res.status(403).end();
  res.json({ msg: "Geüpload!" });
});

app.delete("/delete/:file", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") return res.status(403).end();
  fs.unlink(path.join(__dirname, "uploads", req.params.file), err => {
    if (err) return res.status(500).json({ msg: "Fout" });
    res.json({ msg: "Verwijderd" });
  });
});

app.listen(PORT, () => console.log(`Server draait op port ${PORT}`));
