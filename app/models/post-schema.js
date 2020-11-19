const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  user_Id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  postsInforamtion: [
    {
      postTitle: {
        type: String,
      },
      postURL: {
        type: String,
      },
      postDescription: {
        type: String,
      },
      numberOfLikes: {
        type: Number,
        default: 0,
      },
      postTime: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

module.exports = mongoose.model("post", postSchema);
