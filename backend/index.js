const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 1333;

app.get("/", (req, res) => {
  res.json({ message: "Item Liman Backend Aktif", port: PORT });
});

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} portunda calisiyor`);
});