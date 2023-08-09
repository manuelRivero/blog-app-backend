import User from "./../../models/user.js";
import joi from "joi";
import { validateBody } from "./../../helpers/validate/index.js";
import mongoose from "mongoose";


export const updateSocial = {
  do: async (req, res) => {
    console.log("update social")
    const { uid } = req;
    const {instagram, facebook, twitter} = req.body;
    const targetUser = User.findById(uid)
    if (!targetUser){
        res.sta
    }
    console.log("target user", targetUser)
  },
};
