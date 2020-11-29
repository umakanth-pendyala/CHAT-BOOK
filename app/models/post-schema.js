const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true
    // ref: "user",
  },
  postInformation: [
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

      likes: {
        numberOfLikes: {
          type: Number,
          default: 0,
        },
        likedBy: [{
          user: {
            type: Schema.Types.ObjectId,
          }
        }]
      },
      postType: {
        type: String,
        required: true,
      },
      postTime: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("post", postSchema);
