import User from "./../../models/user.js";
import joi from "joi";
import { validateBody } from "./../../helpers/validate/index.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";



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

export const getProfile = {
  do: async (req, res) => {
    const {token} = req.cookies
    const {slug} = req.params
    let isSameUser = false;
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    const targetProfile = await User.findOne({slug:slug})
    console.log("targetProfile", targetProfile)
    if(targetProfile._id.toString() === uid){
      console.log("if case")
      isSameUser = true
    }

    return res.json({data:{isSameUser, profileData: targetProfile}})
  },
};
