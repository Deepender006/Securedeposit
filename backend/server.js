const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const fdrRoutes = require("./routes/fdrRoutes");
const documentRoutes = require("./routes/documentRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AICTE SecureDeposit Backend is running!"
  });
});

app.use("/api/fdr", fdrRoutes);
app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});