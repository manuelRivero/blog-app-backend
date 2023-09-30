import { validateBody } from "../../helpers/validate/index.js";
import Category from "../../models/category.js";
import joi from "joi";

export const createCategory = {
  check: (req, res, next) => {
    const schema = joi.object({
        name: joi.string().required(),
      });
      validateBody(req, next, schema);
  },
  do: async (req, res, next) => {
    const { name } = req.body;
    try {
      const targetCategory = await Category.findOne({
        name:  {'$regex': `^${name}$`,$options:'i'},
      });
      console.log("targetCategory",targetCategory)
      if (targetCategory) {
        res.status(400).json({
          ok: false,
          error: "La categoría ya existe",
        });
      } else {
        const newCategory = new Category({
          name,
        });
        await newCategory.save();
        res.status(201).json({
            ok: true,
            category: newCategory,
          });
      }
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: "Error al guardar la categoría ",
      });
    }
  },
};

export const getCategories = {
    do: async (req, res) => {
        const {page = 0} = req.params
        const pageSize = 10
        const categories = await Category.find().skip(page * 10).limit(pageSize)
        res.json({
            ok:true,
            categories
        })
    }
}
