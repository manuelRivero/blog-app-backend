import { Schema, model } from "mongoose";


const Category = Schema(
  {
    name: { type: String },
  },
  {
    collection: "categories",
    timestamps: true,
  }
);


export default model("Category", Category);
