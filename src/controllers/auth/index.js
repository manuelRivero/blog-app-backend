import User from "./../../models/user.js";
import {validateBody} from "./../../helpers/validate/index.js";
import bcript from "bcryptjs";
import joi from "joi"

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
      if (targetUser) {
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
      user.password = bcript.hashSync(body.password, salt);
      const newUser = new User({
        name,
        lastName,
        email,
        avatar: files ? files.avatar : null,
      });
      newUser.password = bcript.hashSync(body.password, salt);
      res.json({
        ok: true,
      });
    } catch (error) {
      res.json({
        ok: false,
        error: "Error en la creación del usuario",
        ref: "email",
      });
    }
  },
};
