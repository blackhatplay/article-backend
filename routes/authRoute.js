const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Validator = require("validator");
const User = require("../models/User");
const router = express.Router();

const registerValidate = require("../validations/register");
const resetPasswordValidate = require("../validations/resetPassword");
const loginValidate = require("../validations/login");
const sendEmail = require("../utils/sendEmail");
const { parseCookies, setCookie, destroyCookie } = require("nookies");

router.post("/register", (req, res) => {
  const { errors, isValid } = registerValidate(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      errors.username = "Username already exist";
      return res.status(400).json(errors);
    } else {
      User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
          errors.email = "Email alredy exist";
          return res.status(400).json(errors);
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              if (err) console.log(err);

              const newUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                email: req.body.email,
                password: hash,
              });

              newUser
                .save()
                .then((user) => {
                  res.json({
                    success: true,
                    username: user.username,
                    email: user.email,
                  });

                  sendEmail(user);
                })
                .catch((err) => console.log(err));
            });
          });
        }
      });
    }
  });
});

router.get("/confirmation/:token", (req, res) => {
  const token = req.params.token;

  jwt.verify(token, process.env.email_secret, (err, payload) => {
    if (err) return res.status(400).json({ message: "invalid link" });

    User.findOne({ email: payload.email }).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "user not found with this email" });
      if (user.confirmed) {
        return res.status(400).json({ message: "Email already confirmed" });
      }
      user.confirmed = true;

      user
        .save()
        .then((user) => res.send({ message: "email confirmed" }))
        .catch((err) => console.log(err));
    });
  });
});

router.delete("/clearCookie", (req, res) => {
  res.clearCookie("articleStoken").json({ message: "cookie cleared" });
});

router.post("/login", (req, res) => {
  const { errors, isValid } = loginValidate(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ username: req.body.user }).then((user) => {
    if (user) {
      bcrypt.compare(req.body.password, user.password).then((isMatch) => {
        if (isMatch) {
          if (!user.confirmed) {
            res.status(401).json({
              success: false,
              verified: false,
              message: "Email confirmation sent! Please verify email.",
            });
            sendEmail(user);
          } else {
            const payload = {
              id: user.id,
              email: user.email,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              confirmed: user.confirmed,
            };

            jwt.sign(
              payload,
              process.env.secret,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) return console.log(err);

                res
                  .cookie("articleStoken", `Bearer ${token}`, {
                    maxAge: 3600000,
                    httpOnly: true,
                  })
                  .json({ success: true, token, verified: true });
              }
            );
          }
        } else {
          errors.password = "Password incorrect";
          return res.status(400).json(errors);
        }
      });
    } else {
      User.findOne({ email: req.body.user }).then((user) => {
        if (user) {
          bcrypt.compare(req.body.password, user.password).then((isMatch) => {
            if (isMatch) {
              if (!user.confirmed) {
                res.status(401).json({
                  success: false,
                  verified: false,
                  message: "Email confirmation sent! Please verify email.",
                });
                sendEmail(user);
              } else {
                const payload = {
                  id: user.id,
                  email: user.email,
                  username: user.username,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  confirmed: user.confirmed,
                };
                jwt.sign(
                  payload,
                  process.env.secret,
                  { expiresIn: 3600 },
                  (err, token) => {
                    if (err) return console.log(err);

                    return res
                      .cookie("articleStoken", `Bearer ${token}`, {
                        maxAge: 3600000,
                        httpOnly: true,
                      })
                      .json({ success: true, token });
                  }
                );
              }
            } else {
              errors.password = "Password incorrect";
              return res.status(400).json(errors);
            }
          });
        } else {
          errors.user = "No user found";
          return res.status(400).json(errors);
        }
      });
    }
  });
});

router.post("/forgot-password", (req, res) => {
  const email = req.body.email ? req.body.email : "";

  if (!Validator.isEmail(email)) {
    return res.status(400).json({ message: "invalid email" });
  }

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(404).json({ message: "Email not registered" });
    const payload = {
      email,
      action: "reset",
    };
    jwt.sign(
      payload,
      process.env.password_secret,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) return console.log(err);

        res.json({
          token,
          message: "Password reset link sent to email",
          success: true,
        });
      }
    );
  });
});

router.post("/verifyForgotToken", (req, res) => {
  const token = req.body.token;

  if (!token)
    return res
      .status(400)
      .json({ code: "INVALID_TOKEN", message: "invalid reset link" });

  jwt.verify(token, process.env.password_secret, (err, payload) => {
    if (err)
      return res
        .status(400)
        .json({ code: "INVALID_TOKEN", message: "invalid reset link" });

    res.json({ code: "VALID_TOKEN", message: "Valid reset link", token });
  });
});

router.post("/reset-password", (req, res) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ code: "INVALID_TOKEN", message: "invalid reset link" });

  const { errors, isValid } = resetPasswordValidate(req.body);

  if (!isValid) return res.status(400).json(errors);

  jwt.verify(token, process.env.password_secret, (err, payload) => {
    if (err)
      return res
        .status(401)
        .json({ code: "INVALID_TOKEN", message: "invalid reset link" });

    User.findOne({ email: payload.email }).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "no user exist with this email" });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) return console.log(err);

        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) return console.log(err);

          user.password = hash;

          user
            .save()
            .then((user) =>
              res.json({ success: true, message: "password changed" })
            )
            .catch((err) => console.log(err));
        });
      });
    });
  });
});

module.exports = router;
