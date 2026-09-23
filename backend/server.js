require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start API server:", error.message);
  process.exit(1);
});
