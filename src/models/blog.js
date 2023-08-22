import { Schema, model } from "mongoose";

const Response = Schema(
  {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
  },
  { timestamps: true }
);

const Comment = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    responses: {
      type: [Response],
      default: null,
    },
  },
  { timestamps: true }
);
const Blog = Schema(
  {
    slug: {
      type: String,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },

    title: {
      type: String,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: [
      {
        type: {
          user: { type: Schema.Types.ObjectId, ref: "User" },
        },
      },
    ],
    comments: {
      type: [Comment],
      default: null,
    },
  },
  {
    collection: "blogs",
    timestamps: true,
  }
);

export default model("Blog", Blog);
