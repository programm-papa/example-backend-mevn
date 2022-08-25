const mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  token = require("./token"),
  userInfo = require("./userInfo");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      require: true,
    },
    unconfirmedMail: {
      type: String,
      unique: true,
    },
    mailToken: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: [{ type: mongoose.Schema.ObjectId, ref: "Role", required: true }],
    region: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
//Виртуальное поле
userSchema.virtual("user_info", {
  ref: "UserInfo",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) return next(error);
      bcrypt.hash(this.password, salt, (error, hash) => {
        if (error) return next(error);
        this.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});
module.exports = mongoose.model("User", userSchema);
