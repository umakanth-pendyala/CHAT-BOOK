const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  post_Id: {
    type: Schema.Types.ObjectId,
    ref: "post",
  },
  comments: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      comment: {
        type: String,
      },
      timeOfComment: {
        type: Date,
        default: Date.now()
      },
    },
  ],
});

module.exports = mongoose.model("comment", commentSchema);
