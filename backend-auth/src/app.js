const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-conversation-studio-phi.vercel.app/"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Auth Running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "backend-auth",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;