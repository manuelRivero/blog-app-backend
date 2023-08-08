import { Schema, model } from "mongoose";

const Blog = Schema(
  {
    user: {
      type: {
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    likes: [
      {
        type: {
          user: { type: Schema.Types.ObjectId, ref: "User" },
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
