const port = process.env.PORT || 4000;
const express = require("express");
const bodyParser = require("body-parser");
global.XMLHttpRequest = require("xhr2");
const cors = require("cors");
const mongoose = require("mongoose");

const uploadRoute = require("./routes/uploadRoute");
const uploadedRoute = require("./routes/uploadedRoute");
const postRoute = require("./routes/postRoute");

require("dotenv").config();

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

require("firebase/storage");

const app = express();

const corsOptions = {
  origin: process.env.ORIGIN,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// const uploadFolder = path.join(__dirname, "uploaded");

// var upload = multer({ storage: storage });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("success");
});

app.use("/upload", uploadRoute);

app.use(`/uploaded`, uploadedRoute);
app.use(`/post`, postRoute);

app.use("/", (req, res) => {
  res.sendStatus(404);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}}`);
});
