import mongoose, { Schema, model } from "mongoose";

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
    bio: {
      type: String,
      defaul: null,
    },
    slug: {
      type: String,
      // slug: ["name", "lastName"],
      // unique: true,
      // slugPaddingSize: 4
    },
    notificationId: {
      type: String,
      default: null,
    },
    fallow: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fallowers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    social: {
      instagram: { type: String, default: null },
      facebook: { type: String, default: null },
      twitter: { type: String, default: null },
    },
    role: {
      type: String,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

export default model("User", User);
