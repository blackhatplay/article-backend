const port = process.env.PORT || 4000;
const express = require("express");
const bodyParser = require("body-parser");
global.XMLHttpRequest = require("xhr2");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const uploadRoute = require("./routes/uploadRoute");
const uploadedRoute = require("./routes/uploadedRoute");
const postRoute = require("./routes/postRoute");
const authRoute = require("./routes/authRoute");
const profileRoute = require("./routes/profileRoute");
const { default: axios } = require("axios");

require("dotenv").config();

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const app = express();

app.use(morgan("dev"));

// const corsOptions = {
//   origin: process.env.ORIGIN,
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

var allowlist = process.env.ORIGIN.split(",");

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(cors(corsOptionsDelegate));

// const uploadFolder = path.join(__dirname, "uploaded");

// var upload = multer({ storage: storage });
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("success");
});
app.get("/api", (req, res) => {
  res.json("success");
});

app.use("/api/upload", uploadRoute);

app.use(`/api/uploaded`, uploadedRoute);
app.use("/api/post", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);

app.use("/", (req, res) => {
  res.sendStatus(404);
});

// setInterval(() => {
//   axios.get("https://article-ping.glitch.me").then((res) => {
//     console.log(res.data);
//   });
// }, 280000);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
