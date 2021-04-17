const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/User");
const autheticateJWT = require("../utils/authenticateJWT");
const profileValidate = require("../validations/profile");

router.post("/", autheticateJWT, (req, res) => {
  const { errors, isValid } = profileValidate(req.body);
  if (!isValid) return res.status(400).json(errors);

  User.findById(req.user.id).then((user) => {
    //continue
    if (user) {
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.save().catch((err) => console.log(err));

      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          if (profile) {
            profile.firstname = req.body.firstname;
            profile.lastname = req.body.lastname;
            profile.about = req.body.about;
            profile.socials.youtube = req.body.youtube;
            profile.socials.twitter = req.body.twitter;
            profile.socials.instagram = req.body.instagram;
            profile.socials.linkedin = req.body.linkedin;
            profile.socials.facebook = req.body.facebook;

            profile
              .save()
              .then((profile) => res.json(profile))
              .catch((err) => console.log(err));
          } else {
            const newProfile = new Profile({
              user: req.user.id,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              about: req.body.about,
              socials: {
                youtube: req.body.youtube,
                twitter: req.body.twitter,
                instagram: req.body.instagram,
                linkedin: req.body.linkedin,
                facebook: req.body.facebook,
              },
            });

            newProfile
              .save()
              .then((profile) => res.json(profile))
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    } else {
      res.status(400).json({ message: "user doesnt exist" });
    }
  });
});

router.get("/", autheticateJWT, (req, res) => {
  const userId = req.user.id;

  Profile.findOne({ user: userId })
    .populate("user", ["email", "username"])
    .then((profile) => {
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    });
});

router.get("/:id", (req, res) => {
  const username = req.params.id;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "no user found" });
      }

      Profile.findOne({ user: user.id })
        .populate("user", ["email", "username"])
        .then((profile) => {
          if (!profile) {
            return res
              .status(404)
              .json({ message: "there is no profile for this user" });
          }

          res.json(profile);
        });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
