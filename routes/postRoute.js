const express = require("express");
const Article = require("../models/Article");
const URLSlugify = require("url-slugify");
const urlSlugify = new URLSlugify();

const router = express.Router();

router.post("/", (req, res, next) => {
  //   console.log(req.body);
  const { title, creator, data } = req.body;
  const newArticle = new Article({
    title,
    creator,
    data: JSON.parse(data),
    urlId: urlSlugify.slugify(title, "-"),
  });

  newArticle
    .save()
    .then((article) => {
      res.json({ urlId: article.urlId });
    })
    .catch((err) => res.json(err));
});

router.get("/:id", (req, res, next) => {
  //   console.log(req.body);
  Article.findOne({ urlId: req.params.id })
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
        const wordCount = (text.match(reg) || []).length;
        const time = (wordCount / 265) * 60 + imageWeight * count;
        const readTime = Math.ceil(time / 60);
        res.json({
          ...article._doc,
          updatedAt: date,
          readTime: readTime,
        });
      } else {
        res.json({});
      }
    })
    .catch((err) => res.json(err));
});

module.exports = router;
