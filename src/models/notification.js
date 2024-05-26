import { Schema, model } from "mongoose";

const Notification = Schema(
  {
    notifedUser: { type: Schema.Types.ObjectId, ref: "User" },
    notifierUser: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String },
    title: { type: String },
    body: { type: String },
    slugBlog: {
      type: String,
    },
    titleBlog: {
      type: String,
    },
  },
  {
    collection: "notifications",
    timestamps: true,
  }
);

export default model("Notification", Notification);
