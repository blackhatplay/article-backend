const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Profile = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    about: {
      type: String,
    },
    socials: {
      youtube: {
        type: String,
      },
      instagram: {
        type: String,
      },
      facebook: {
        type: String,
      },
      twitter: {
        type: String,
      },
      linkedin: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("profiles", Profile);
