import User from "./../../models/user.js";
import joi from "joi";
import { validateBody } from "./../../helpers/validate/index.js";


export const updateSocial = {
  do: async (req, res) => {
    const { uid } = req;
    const {instagram, facebook, twitter} = req.body;
    const targetUser = User.findById(mongoose.Types.ObjectId(uid))
  },
};
