const express = require("express");
const multer = require("multer");
// const firebaseConfig = require("../config/firebaseConfig");
const firebase = require("firebase/app");
const axios = require("axios");

require("dotenv").config();
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
};

const router = express.Router();
firebase.initializeApp(firebaseConfig);

var upload = multer();

router.post("/byUrl", async (req, res, next) => {
  const storageRef = firebase.storage().ref();
  // req.file is the `image` file
  // req.body will hold the text fields, if there were any
  const imagesRef = storageRef.child(`images/pp.jpg`);
  const metadata = { contentType: "image/jpeg" };

  const response = await axios.get(req.body.url, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data, "utf-8");

  imagesRef
    .put(buffer, metadata)
    .then((snapshot) => {
      res.json({
        success: 1,
        file: {
          url: `https://firebasestorage.googleapis.com/v0/b/${snapshot._delegate.metadata.bucket}/o/images%2F${snapshot._delegate.metadata.name}?alt=media`,
          //https://firebasestorage.googleapis.com/v0/b/articles-c8ae7.appspot.com/o/images%2F12345.jpg?alt=media
          // ... and any additional fields you want to store, such as width, height, color, extension, etc
        },
      });
    })
    .catch((err) => console.log(err));
});

router.post(`/byFile`, upload.single("image"), function (req, res, next) {
  const storageRef = firebase.storage().ref();
  // req.file is the `image` file
  // req.body will hold the text fields, if there were any

  const metadata = {
    contentType: req.file.mimetype,
    name: req.file.originalname,
  };

  const names = req.file.originalname.split(".");

  const imagesRef = storageRef.child(
    `images/${names[0] + "-" + Date.now() + "." + names[1]}`
  );

  imagesRef
    .put(req.file.buffer, metadata)
    .then((snapshot) => {
      res.json({
        success: 1,
        file: {
          url: `https://firebasestorage.googleapis.com/v0/b/${snapshot._delegate.metadata.bucket}/o/images%2F${snapshot._delegate.metadata.name}?alt=media`,
          //https://firebasestorage.googleapis.com/v0/b/articles-c8ae7.appspot.com/o/images%2F12345.jpg?alt=media
          // ... and any additional fields you want to store, such as width, height, color, extension, etc
        },
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
