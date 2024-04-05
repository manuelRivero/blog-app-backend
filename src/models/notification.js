import { Schema, model } from "mongoose";

const Notification = Schema(
    {
      type: { type: String },

    },
    {
      blog: { type: Schema.Types.ObjectId, ref: "Blog" },
    },
    {
      collection: "notifications",
      timestamps: true,
    }
  );
  
  
  export default model("Notification", Notification);