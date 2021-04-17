const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // const authHeader = req.headers["authorization"];

  const cookies = req.cookies;

  const cookie = cookies.articleStoken;

  const token = cookie && cookie.split(" ")[1];

  if (token === null)
    return res.status(400).json({ message: "user not authorised" });

  jwt.verify(token, process.env.secret, (err, user) => {
    if (err) return res.status(400).json({ message: "Unauthorized" });

    req.user = user;

    next();
  });
};
