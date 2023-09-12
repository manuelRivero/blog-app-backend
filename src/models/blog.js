import { Schema, model } from "mongoose";

const Response = Schema(
  {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      createdAt: {type: Date, default: Date.now}
  },
  { timestamps: true }
);

const Comment = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    responses: {
      type: [Response],
      default: [],
    },
  },
  { timestamps: true }
);
const Blog = Schema(
  {
    category:{
      type: Schema.Types.ObjectId, ref: "Category"
    },

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
      default: [],
    },
  },
  {
    collection: "blogs",
    timestamps: true,
  }
);

export default model("Blog", Blog);
