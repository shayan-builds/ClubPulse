
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Feedback = require("./models/feedback");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "ClubPulse backend is running!" });
});

// Submit anonymous feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { clubName, category, message } = req.body;

    if (!clubName?.trim() || !category || !message?.trim()) {
      return res.status(400).json({
        message: "Club name, category, and message are required.",
      });
    }

    const feedback = await Feedback.create({
      clubName,
      category,
      message,
    });

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid feedback data.",
      });
    }

    console.error("Feedback submission error:", error.message);
    res.status(500).json({
      message: "Something went wrong while submitting feedback.",
    });
  }
});

// Start server only after MongoDB connects
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`ClubPulse server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
