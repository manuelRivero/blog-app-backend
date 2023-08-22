import { Schema, model } from "mongoose";

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
    comments: [
      {
        type: {
          user: { type: Schema.Types.ObjectId, ref: "User" },
          content: { type: String },
          responses: {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            content: { type: String },
          },
        },
      },
    ],
  },
  {
    collection: "blogs",
    timestamps: true,
  }
);

export default model("Blog", Blog);
