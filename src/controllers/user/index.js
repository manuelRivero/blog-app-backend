import User from "./../../models/user.js";
import joi from "joi";
import { validateBody } from "./../../helpers/validate/index.js";
import cloudinary from "../../helpers/imageUpload/index.js";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const updateProfile = {
  do: async (req, res) => {
    const { uid } = req;
    const {files = null} = req
    const { profileData = null, socialData = null } = req.body;
    const targetUser = await User.findOne(
      { _id: new mongoose.Types.ObjectId(uid) },
      " -password -email -blogs -fallow -fallowers -provider"
    );
    if (!targetUser) {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    if (profileData) {
      const data = JSON.parse(profileData);

      // Special characters and the characters they will be replaced by.
      const specialCharacters = "àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź";
      const replaceCharacters = "aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz";

      let urlFriendlyName = "";
      let urlFriendlyLastName = "";

      // Initial clean up.
      let name = data.name
        .trim()
        .toLowerCase()
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, " ");

      let lastName = data.lastName
        .trim()
        .toLowerCase()
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, " ");

      const specialCharactersRegularExpression = new RegExp(
        specialCharacters.split("").join("|"),
        "g"
      );

      name = name
        .replace(specialCharactersRegularExpression, (matchedCharacter) =>
          replaceCharacters.charAt(specialCharacters.indexOf(matchedCharacter))
        )
        .replace(/œ/g, "oe");

      lastName = lastName
        .replace(specialCharactersRegularExpression, (matchedCharacter) =>
          replaceCharacters.charAt(specialCharacters.indexOf(matchedCharacter))
        )
        .replace(/œ/g, "oe");

      urlFriendlyName = name.replace(/\s+/g, "-");
      urlFriendlyLastName = lastName.replace(/\s+/g, "-");

      targetUser.name = data.name;
      targetUser.lastName = data.lastName;
      targetUser.bio = data.bio || null;

      const targetSlugCount = await User.find({
        slug: `${urlFriendlyName}-${urlFriendlyLastName}`,
        _id: { $not: { $eq: targetUser._id } },
      }).count();

      if (targetSlugCount > 0) {
        targetUser.slug = `${urlFriendlyName}-${urlFriendlyLastName}.${
          targetSlugCount + 1
        }`;
      } else {
        targetUser.slug = `${urlFriendlyName}-${urlFriendlyLastName}`;
      }
    }
 
    if (socialData) {
      const data = JSON.parse(socialData);
      targetUser.social.facebook = data.facebook || null;
      targetUser.social.instagram = data.instagram || null;
      targetUser.social.twitter = data.twitter || null;
    }
    if (files) {
      try {
        const imageUrl = await cloudinary.uploader.upload(
          files.image.tempFilePath,
          { folder: "users" }
        );
        console.log("imageUrl.secure_url", imageUrl.secure_url)
        targetUser.avatar = imageUrl.secure_url;
      } catch (error) {
        res.status(400).json({ ok: false, error: "Error al subir el avatar" });
        console.log("error al subir el avatar", error);
      }
    }
    await targetUser.save();
    return res.json({
      ok: true,
      user: targetUser,
    });
  },
};

export const getProfile = {
  do: async (req, res) => {
    const { token } = req.cookies;
    const { slug } = req.params;
    let isSameUser = false;
    if (token) {
      try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const targetProfile = await User.findOne({ slug: slug }, "-password");
        
        if (targetProfile._id.toString() === uid) {
          isSameUser = true;
        }
        const {_doc} = {...targetProfile}
        _doc.blogs = _doc.blogs.length;
        _doc.fallow = _doc.fallow.length;
        _doc.fallowers = _doc.fallowers.length;
        return res.json({ data: { isSameUser, profileData: _doc } });
      } catch (error) {
        return res.status(401).json({
          ok: false,
          message: "Token no válido",
        });
      }
    } else {
      const targetProfile = await User.findOne({ slug: slug }, "-password");
      const {_doc} = {...targetProfile}
      _doc.blogs = _doc.blogs.length;
      _doc.fallow = _doc.fallow.length;
      _doc.fallowers = _doc.fallowers.length;
      return res.json({ data: { isSameUser, profileData: _doc } });
    }
  },
};
