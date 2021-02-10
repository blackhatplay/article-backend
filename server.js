const express = require("express");
const download = require("download-file");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
const port = process.env.PORT || 4000;

// const uploadFolder = path.join(__dirname, "uploaded");
const uploadFolder = "uploaded/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const names = file.originalname.split(".");
    cb(null, names[0] + "-" + Date.now() + "." + names[1]);
  },
});

var upload = multer({ storage: storage });

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ msg: "test" });
});

app.post("/byUrl", (req, res, next) => {
  const name = Math.floor(Date.now() / 1000).toString();
  const options = {
    directory: uploadFolder,
    filename: `${name}.jpg`,
  };

  download(req.body.url, options, function (err) {
    if (err) {
      console.log(err);
    }
    res.json({
      success: 1,
      file: {
        url: `http://localhost:4000/uploaded/${name}.jpg`,
        // ... and any additional fields you want to store, such as width, height, color, extension, etc
      },
    });
  });
});

app.post("/byFile", upload.single("image"), function (req, res, next) {
  // req.file is the `image` file
  // req.body will hold the text fields, if there were any
  res.json({
    success: 1,
    file: {
      url: `http://localhost:4000/uploaded/${req.file.filename}`,
      // ... and any additional fields you want to store, such as width, height, color, extension, etc
    },
  });
});

app.use("/uploaded", express.static("uploaded"));

app.listen(port, () => {
  console.log(`server is running on port ${port}}`);
});
