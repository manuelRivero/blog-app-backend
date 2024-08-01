import { Schema, model } from "mongoose";

const Payment = Schema(
  {
    notifedUser: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    collection: "payments",
    timestamps: true,
  }
);

export default model("Payment", Payment);
