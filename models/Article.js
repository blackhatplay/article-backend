const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Article = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    title: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    urlId: {
      type: String,
      required: true,
    },
    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        text: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    data: {
      time: {
        type: Number,
        required: true,
      },
      blocks: [
        {
          type: {
            type: String,
          },
          data: {
            text: {
              type: String,
            },
            level: {
              type: Number,
            },
            file: {
              url: {
                type: String,
              },
              caption: {
                type: String,
              },
              alignment: {
                type: String,
              },
              withBorder: {
                type: Boolean,
              },
              stretched: {
                type: Boolean,
              },
              withBackground: {
                type: Boolean,
              },
            },
          },
        },
      ],
      version: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("article", Article);
