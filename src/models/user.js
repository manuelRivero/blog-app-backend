import { Schema, model } from "mongoose";

const User = Schema(
  {
    name: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    avatar: {
      type: String,
    },
    provider: {
      type: String,
      default: "web",
    },
    fallow: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fallowers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    social: {
      type: {
        instagram: { type: String, default: null },
        facebook: { type: String, default: null },
        twitter: { type: String, default: null },
      },
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

export default model("User", User);
