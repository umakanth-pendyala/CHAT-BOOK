const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const Posts = require("../models/post-schema");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // unique: true,
    required: [true, "User Email is required"],
    validate: {
      validator: function (v) {
        var result = v.search("@gitam.in");
        if (result == -1) return false;
      },
      message: props => `${props.value} is not a valid Gitam mail!`,
    },
  },
  password: {
    type: String,
    required: [true, "password should not be empty"],
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
        return regex.test(v);
      },
      message: props => `${props.value} is not a valid Phone Number`,
    },
  },
  dateOfBirth: {
    type: String,
    enum: {
      message: "Invalid Phone number",
      values: [
        /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/,
      ],
    },
  },
  gender: {
    type: String,
    enum: {
      values: ["Male", "Female", "Other"],
      message: "invliad Gender entered",
    },
  },
  bio: {
    type: String,
    maxlength: 300,
  },
  profilePicURL: {
    type: String,
  },
  relationshipStatus: {
    type: String,
    enum: {
      values: ["Single", "Taken"],
      message: "Relation ship status can be only single or taken",
    },
  },
  profession: {
    type: String,
  },
  profileStatus: {
    type: String,
    default: "Active",
    enum: {
      values: ["Active", "In-Active"],
      message: "Invalid profile status",
    },
  },
  validationOTP: {
    type: String,
  },
  friends: [
    {
      friend_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      friend_name: {
        type: String,
        required: true,
      },
    },
  ],
  friendRequestsToYou: [
    {
      friend_Id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },

      dateOfRequest: {
        type: String,
        default: Date.now(),
      },
    },
  ],
  friendRequestsByYou: [
    {
      friend_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      dateOfRequest: {
        type: String,
        default: Date.now(),
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  var user = this;
  if (!user.isModified("password")) return next();
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;
  return next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  const data = this.password;
  const passwordMatched = bcrypt.compareSync(enteredPassword, this.password);
  if (passwordMatched) return true;
  else return false;
};

module.exports = mongoose.model("user", userSchema);
