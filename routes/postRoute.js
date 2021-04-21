const express = require("express");
const URLSlugify = require("url-slugify");
const Article = require("../models/Article");
const authenticateJWT = require("../utils/authenticateJWT");
const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");
const urlSlugify = new URLSlugify();

const router = express.Router();

router.post("/", authenticateJWT, (req, res, next) => {
  //   console.log(req.body);
  const { title, creator, data } = req.body;
  const userId = req.user.id;
  const newArticle = new Article({
    user: userId,
    title,
    creator,
    data: data,
    urlId: urlSlugify.slugify(title, "-"),
  });

  newArticle
    .save()
    .then((article) => {
      res.json({ urlId: article.urlId });
    })
    .catch((err) => res.json(err));
});

router.post("/edit", authenticateJWT, (req, res, next) => {
  //   console.log(req.body);
  const { title, creator, data, urlId } = req.body;
  const userId = req.user.id;
  Article.findOne({ urlId }).then((article) => {
    if (!article) {
      return res.status(404).json({ message: "article not found" });
    }
    if (userId === article.user.toString()) {
      article.title = title;
      article.data = data;
      article.creator = creator;
      console.log("pp");
      article
        .save()
        .then((article) => {
          axios
            .get(`${process.env.EMAIL_ORIGIN}/${article.urlId}`)
            .then((data) => res.json(article))
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    } else {
      res.status(401).json({ message: "you are not the creator" });
    }
  });
});

router.get("/all", (req, res) => {
  Article.find({}).then((articles) => {
    if (!articles) {
      return res.status(404).json({ message: "no article found" });
    }

    res.json(articles);
  });
});

router.get("/all/paths", (req, res) => {
  Article.find({}, { urlId: 1 }).then((articles) => {
    if (!articles) {
      return res.status(404).json({ message: "no article found" });
    }

    res.json(articles);
  });
});

router.get("/user", authenticateJWT, (req, res) => {
  const userId = req.user.id;

  const tagPattern = "<\\w+(\\s+(\"[^\"]*\"|\\'[^\\']*'|[^>])+)?>|<\\/\\w+>";
  const tagReg = new RegExp(tagPattern, "gi");

  Article.find({ user: userId })
    .then((articles) => {
      articles.forEach((article) => {
        const date = new Date(article.updatedAt).toDateString();
        let text = "";
        article.data.blocks.forEach((block) => {
          if (block.data.text) {
            text += block.data.text;
          }
        });

        text = text.replace(/^\s+/, "").replace(/\s+$/, "");
        text = text.replace(tagReg, "");
        const desc = text.substring(0, 200);
        article._doc.updatedAt = date;
        article._doc.desc = desc;
      });

      res.json(articles);
    })
    .catch((err) => console.log(err));
});

router.get("/user/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!userId) return res.status(400).json({ message: "invalid username" });

  Article.find({ user: userId })
    .populate("user", ["email", "username", "id"])
    .then((articles) => {
      if (articles.length === 0)
        return res.status(404).json({ message: "no articles found" });

      res.json(articles);
    });
});

router.post("/like/:pid", authenticateJWT, (req, res) => {
  const urlId = req.params.pid;
  Article.findOne({ urlId })
    .then((article) => {
      if (!article) {
        return res.status(404).json({ message: "article not found" });
      }

      if (
        article.likes.filter((like) => like.user.toString() === req.user.id)
          .length > 0
      ) {
        return res
          .status(400)
          .json({ message: "already liked the article", success: false });
      }

      article.likes.unshift({ user: req.user.id });
      article
        .save()
        .then((article) => res.json({ success: true, message: "liked" }))
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.get("/like/:pid", authenticateJWT, (req, res) => {
  const urlId = req.params.pid;

  Article.findOne({ urlId }).then((article) => {
    if (!article) {
      return res.status(404).json({ message: "article not found" });
    }

    if (
      article.likes.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.json({ liked: true });
    } else {
      res.json({ liked: false });
    }
  });
});

router.post("/unlike/:pid", authenticateJWT, (req, res) => {
  const urlId = req.params.pid;

  Article.findOne({ urlId }).then((article) => {
    if (!article) return res.status(404).json({ message: "article not found" });

    const userLike = article.likes.filter(
      (like) => like.user.toString() === req.user.id
    );

    if (userLike.length === 0) {
      res.status(400).json({ success: false, message: "not liked yet" });
    } else {
      const removeIndex = article.likes.indexOf(userLike[0]);
      article.likes.splice(removeIndex, 1);
      article
        .save()
        .then((article) => res.json({ success: true, message: "like removed" }))
        .catch((err) => console.log(err));
    }
  });
});

router.delete("/:pid", authenticateJWT, (req, res) => {
  const urlId = req.params.pid;
  const userId = req.user.id;

  Article.findOne({ urlId })
    .then((article) => {
      if (!article) {
        return res.status(404).json({ message: "article not found" });
      }

      if (article.user.toString() === userId) {
        article.remove();
        res.json({ message: "article delelted" });
      } else {
        res.status(401).json({ message: "you are not the creator" });
      }
    })
    .catch((err) => console.log(err));
});

router.get("/:id", (req, res, next) => {
  Article.findOne({ urlId: req.params.id })
    .populate("user", ["username", "email", "id"])
    .then((article) => {
      if (article) {
        const date = new Date(article.updatedAt).toDateString();
        let imageWeight = 12;
        let count = 0;
        let text = "";
        const tagPattern =
          "<\\w+(\\s+(\"[^\"]*\"|\\'[^\\']*'|[^>])+)?>|<\\/\\w+>";
        const tagReg = new RegExp(tagPattern, "gi");

        const pattern = "\\w+";
        const reg = new RegExp(pattern, "g");

        article.data.blocks.forEach((block) => {
          if (block.data.text) {
            text += block.data.text;
          } else if (block.type === "image") {
            imageWeight--;
            count++;
          }
        });
        text = text.replace(/^\s+/, "").replace(/\s+$/, "");
        text = text.replace(tagReg, "");
        const desc = text.substring(0, 100);
        const wordCount = (text.match(reg) || []).length;
        const time = (wordCount / 265) * 60 + imageWeight * count;
        const readTime = Math.ceil(time / 60);
        const likesCount = article.likes.length;
        res.json({
          ...article._doc,
          updatedAt: date,
          readTime: readTime,
          likesCount,
          desc,
        });
      } else {
        res.json({});
      }
    })
    .catch((err) => res.json(err));
});

module.exports = router;
