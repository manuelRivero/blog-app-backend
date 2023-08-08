import User from "./../../models/user.js";
import {validateBody} from "./../../helpers/validate/index.js";
import bcript from "bcryptjs";
import joi from "joi"
import { generatejWT } from "../../helpers/auth/auth/index.js";

export const register = {
  check: (req, res, next) => {
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      lastName: joi.string().required(),
      password: joi.string().min(8).required(),
    });
    validateBody(req, next, schema);
  },
  do: async (req, res, next) => {
    const { files, body, errorFormat } = req;
    console.log("errorFormat", errorFormat)
    const { name, lastName, password, email } = body;

    try {
      const targetUser = await User.find({ email: email });
      console.log("target user", targetUser)
      if (!targetUser.length === 0) {
        res.json({
          ok: false,
          error: "Usuario ya registrado",
          ref: "email",
        });
        return;
      }
    } catch (error) {
      res.json({
        ok: false,
        error: "Error al identificar al usuario",
        ref: "email",
      });
    }
    try {
      const salt = bcript.genSaltSync();
      const newUser = new User({
        name,
        lastName,
        email,
        avatar: files ? files.avatar : null,
      });
      newUser.password = bcript.hashSync(body.password, salt);
      await newUser.save();
      res.json({
        ok: true,
      });
    } catch (error) {
      console.log("error", error)
      res.json({
        ok: false,
        error: "Error en la creación del usuario",
        ref: "email",
      });
    }
  },
};

export const login = {
  check: (req, res, next) => {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
    });
    validateBody(req, next, schema);
  },
  do: async (req, res, next) =>{ 
    const { email, password } = req.body;
    const targetUser = await User.findOne({email});
    if (!targetUser) {
      return res.status(404).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }
    if (!bcript.compareSync(password, targetUser.password )) {
      return res.status(404).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }
    const token = await generatejWT(targetUser.id, targetUser.role);
    res.status(200).json({
      ok: true,
      token,
    });
  }
}
