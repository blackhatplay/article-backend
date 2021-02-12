const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/:file", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../uploaded", req.params.file));
});

module.exports = router;
