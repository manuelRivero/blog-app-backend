import User from "./../../models/user.js";
import joi from "joi";
import { validateBody } from "./../../helpers/validate/index.js";
import cloudinary from "../../helpers/imageUpload/index.js";
import admin from "firebase-admin";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Notification from "../../models/notification.js";

export const updateProfile = {
  do: async (req, res) => {
    const { uid } = req;
    const { files = null } = req;
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
        console.log("imageUrl.secure_url", imageUrl.secure_url);
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
    console.log("token", token);
    if (token) {
      try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const targetProfile = await User.findOne({ slug: slug }, "-password");
        const isFollower = await User.findOne({
          slug: slug,
          fallowers: new mongoose.Types.ObjectId(uid),
        });

        if (targetProfile._id.toString() === uid) {
          isSameUser = true;
        }

        const info = {
          blogs: targetProfile.blogs.length,
          fallow: targetProfile.fallow.length,
          fallowers: targetProfile.fallowers.length,
        };

        if (isSameUser) {
          return res.json({
            data: {
              isSameUser,
              profileData: { ...targetProfile.toObject(), ...info },
            },
          });
        } else {
          return res.json({
            data: {
              isSameUser,
              profileData: {
                ...targetProfile.toObject(),
                ...info,
                follow: !!isFollower,
              },
            },
          });
        }
      } catch (error) {
        console.log("error follows", error);
        // return res.status(401).json({
        //   ok: false,
        //   message: "Token no válido",
        // });
      }
    } else {
      const targetProfile = await User.findOne({ slug: slug }, "-password");
      const info = {
        blogs: targetProfile.blogs.length,
        fallow: targetProfile.fallow.length,
        fallowers: targetProfile.fallowers.length,
      };
      console.log("results", { ...targetProfile.toObject(), ...info });
      return res.json({
        data: {
          isSameUser,
          profileData: { ...targetProfile.toObject(), ...info },
        },
      });
    }
  },
};

export const fallow = {
  do: async (req, res) => {
    const { id } = req.body;
    const { uid } = req;
    console.log("uid", uid);
    const targetUser = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $push: {
          fallowers: new mongoose.Types.ObjectId(uid),
        },
      },
      { new: true }
    );
    const followUser = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(uid) },
      {
        $push: {
          fallow: new mongoose.Types.ObjectId(id),
        },
      },
      { new: true }
    );

    const messaje = {
      notification: {
        title: `Nuevo seguidor`,
        body: `${targetUser.name} a comenzado a seguirte`,
      },
      data: {
        idUserBlog: targetUser._id.toString(),
        nameUserComment: targetUser.name,
        type: "follow",
        redirectSlug: followUser.slug,
      },
      token: targetUser.notificationId,
    };
    const notification = new Notification({
      notifedUser: targetUser._id.toString(),
      notifierUser: followUser._id.toString(),
      redirectSlug: followUser.slug,
      type: "fallow",
      title: `Nuevo seguidor`,
      body: `${followUser.name} ${followUser.lastName} ha comenzado a seguirte`,
    });

    await notification.save();
    admin
      .messaging()
      .send(messaje)
      .then()
      .catch((e) => {
        throw new Error("NOTIFICATION");
      });

    res.status(201).json({
      ok: true,
    });
  },
};

export const unFallow = {
  do: async (req, res) => {
    const { id } = req.body;
    const { uid } = req;
    try {
      const fallowUSer = await User.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $pull: {
            fallowers: new mongoose.Types.ObjectId(uid),
          },
        },
        { new: true }
      );
      const targetUSer = await User.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(uid) },
        {
          $pull: {
            fallow: new mongoose.Types.ObjectId(id),
          },
        },
        { new: true }
      );

      console.log("responses follow", fallowUSer);
      console.log("responses target", targetUSer);
      res.status(200).json({
        ok: true,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
      });
    }
  },
};
