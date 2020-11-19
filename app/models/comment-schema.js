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
      userName: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("commnet", commentSchema);
