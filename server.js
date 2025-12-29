// ================================
// LUMENPATH BACKEND (SINGLE FILE)
// ================================

// ---------- IMPORTS ----------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------- CONFIG ----------
const app = express();
const PORT = 5000;
const JWT_SECRET = "lumenpath_super_secret_key";

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- DATABASE ----------
mongoose.connect("mongodb://127.0.0.1:27017/lumenpath", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ DB Error", err));

// ---------- SCHEMAS ----------

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

// Profile Schema
const ProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  role: String,
  skills: [String],
  experience: Number
});

// Roadmap Schema
const RoadmapSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  targetRole: String,
  steps: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Profile = mongoose.model("Profile", ProfileSchema);
const Roadmap = mongoose.model("Roadmap", RoadmapSchema);

// ---------- AUTH MIDDLEWARE ----------
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ---------- ROUTES ----------

// 🔹 Health Check
app.get("/", (req, res) => {
  res.send("🚀 LumenPath Backend Running");
});

// 🔹 Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashed });
    res.json({ success: true, userId: user._id });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

// 🔹 Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ token, name: user.name });
});

// 🔹 Save Profile (Skills)
app.post("/api/profile", auth, async (req, res) => {
  const { role, skills, experience } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.userId },
    { role, skills, experience },
    { upsert: true, new: true }
  );

  res.json(profile);
});

// 🔹 Generate Roadmap (Mock AI Logic)
app.post("/api/roadmap", auth, async (req, res) => {
  const { targetRole } = req.body;

  // Mock AI output (replace with Gemini later)
  const steps = [
    "Strengthen core fundamentals",
    "Learn advanced tools for " + targetRole,
    "Build 2 real-world projects",
    "Practice system design",
    "Apply to curated roles"
  ];

  const roadmap = await Roadmap.create({
    userId: req.userId,
    targetRole,
    steps
  });

  res.json(roadmap);
});

// 🔹 Dashboard Data
app.get("/api/dashboard", auth, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.userId });
  const roadmaps = await Roadmap.find({ userId: req.userId });

  res.json({
    profile,
    roadmaps
  });
});

// ---------- SERVER ----------
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
