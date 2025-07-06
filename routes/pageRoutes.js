const express = require("express");
const router = express.Router();

// app.get("/xtempo", (req, res) => {
//   res.sendFile(path.join(__dirname, "public/html/xtempo.html"));
// });

// app.get("/socalwear", (req, res) => {
//   res.sendFile(path.join(__dirname, "public/html/socalwear.html"));
// });

// app.get("/starlinker", (req, res) => {
//   res.sendFile(path.join(__dirname, "public/html/starlinker.html"));
// });

// app.get("/coffeepots", (req, res) => {
//   res.sendFile(path.join(__dirname, "public/html/coffeepots.html"));
// });

const goToSocalWear = (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/socalwear.html"));
};

router.route("/").get(goToSocalWear);

module.exports = router;
