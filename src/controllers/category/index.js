import { validateBody } from "../../helpers/validate/index.js";
import Category from "../../models/category.js";
import joi from "joi";
import User from "../../models/user.js";
import mongoose from "mongoose";

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
        name: { $regex: `^${name}$`, $options: "i" },
      });
      console.log("targetCategory", targetCategory);
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
    const { page = 0, search } = req.params;
    const pageSize = 10;
    const categories = await Category.find(
      search ? { $text: { $search: searchString } } : {}
    )
      .skip(page * 10)
      .limit(pageSize);
    res.json({
      ok: true,
      categories,
    });
  },
};

export const getAllCategories = {
  do: async (req, res) => {
    const { searchText } = req.query;
    const { uid } = req;
    const targetUser = await User.findById(uid);
    const hasPermission = Boolean(targetUser.role === "admin");
    const regex = new RegExp(searchText, "i");
    const supportId = new mongoose.Types.ObjectId("6694426a8c2bf4e9e0d7adf0");
    const matchQuery = !hasPermission ? { _id: { $nin: [supportId] } } : {};

    const searchQuery = searchText ? { name: { $regex: regex } } : {};
    let categories;
    categories = await Category.aggregate([
      {
        $match: {
          ...matchQuery,
          ...searchQuery,
        },
      },
    ]);

    res.json({
      ok: true,
      categories,
    });

    // const categories = await Category.find()
    // res.json({
    //     ok:true,
    //     categories
    // })
  },
};
