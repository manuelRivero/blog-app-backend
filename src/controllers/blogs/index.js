import Blog from "../../models/blog.js";
import User from "../../models/user.js";
import fs from "fs";
import cloudinary from "../../helpers/imageUpload/index.js";
import mongoose from "mongoose";

export const createBlog = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { title, description, content } = req.body;
    const { files } = req;
    const { uid } = req;
    // Special characters and the characters they will be replaced by.
    const specialCharacters = "àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź";
    const replaceCharacters = "aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz";
    const specialCharactersRegularExpression = new RegExp(
      specialCharacters.split("").join("|"),
      "g"
    );
    let urlFriendlySlug = "";
    let parseTitle = title
      .trim()
      .toLowerCase()
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, " ");

    parseTitle = parseTitle
      .replace(specialCharactersRegularExpression, (matchedCharacter) =>
        replaceCharacters.charAt(specialCharacters.indexOf(matchedCharacter))
      )
      .replace(/œ/g, "oe");
    urlFriendlySlug = parseTitle.replace(/\s+/g, "-");

    const blog = new Blog({
      title,
      description,
      content,
      user: new mongoose.Types.ObjectId(uid),
    });

    const targetSlugCount = await Blog.find({
      slug: `${urlFriendlySlug}`,
    }).count();

    if (targetSlugCount > 0) {
      blog.slug = `${urlFriendlySlug}.${targetSlugCount + 1}`;
    } else {
      blog.slug = `${urlFriendlySlug}`;
    }

    try {
      const imageUrl = await cloudinary.uploader.upload(
        files.image.tempFilePath,
        { folder: "blogs-uploads" }
      );
      console.log("imageUrl.secure_url", imageUrl.secure_url);
      blog.image = imageUrl.secure_url;
    } catch (error) {
      res
        .status(400)
        .json({ ok: false, error: "Error al subir la imagen del blog" });
      console.log("Error al subir la imagen del blog", error);
    }

    try {
      await blog.save();
      fs.unlinkSync(files.image.tempFilePath);
      res.status(201).json({
        ok: true,
        blog,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error,
      });
      fs.unlinkSync(files.image.tempFilePath);
    }
  },
};

export const blogDetail = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { slug } = req.params;
    try {
      const targetBlog = await Blog.findOne({ slug: slug })
        .select(" -comments")
        .populate("user", " avatar slug name lastName");
      if (!targetBlog) {
        res.status(404).json({
          ok: false,
          error: "Blog no encontrado",
        });
      } else {
        res.json({
          blog: targetBlog,
        });
      }
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: "Error al buscar el blog",
      });
    }
  },
};

export const comments = {
  do: async (req, res, next) => {
    const { slug, page = 0 } = req.query;
    const pageSize = 10;
    console.log("slug", slug, page);
    try {
      const comments = await Blog.aggregate([
        {
          $match: { slug: { $regex: ".*" + slug + ".*", $options: "i" } },
        },
        { $unwind: "$comments" },
        {
          $group: {
            _id: "$comments._id",
            createAt: { $first: "$comments.createdAt" },
            user: { $first: "$comments.user" },
            content: { $first: "$comments.content" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  slug: 1,
                  avatar: 1,
                  lastName: 1,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $facet: {
            metadata: [{ $count: "count" }],
            data: [{ $skip: page * pageSize }, { $limit: pageSize }],
          },
        },
      ]);
      console.log("comments", comments);
      res.json({
        ok: true,
        comments,
      });
    } catch (error) {
      console.log("error", error);
    }
  },
};

export const responses = {
  do: async (req, res, next) => {
    const { slug, page = 0, commentId } = req.query;
    const pageSize = 10;
    console.log("slug", slug, page);
    try {
      const responses = await Blog.aggregate([
        {
          $match: { slug: { $regex: ".*" + slug + ".*", $options: "i" } },
        },
        { $unwind: "$comments" },
        {
          $group: {
            _id: "$comments._id",
            createAt: { $first: "$comments.createdAt" },
            user: { $first: "$comments.user" },
            content: { $first: "$comments.content" },
            responses: { $first: "$comments.responses" },
          },
        },
        { $unwind: "$comments.responses" },
      ]);
      console.log("responses", responses);
      res.json({
        ok: true,
        responses,
      });
    } catch (error) {
      console.log("error", error);
    }
  },
};

export const createComment = {
  do: async (req, res, next) => {
    const { slug, content } = req.body;
    const { uid } = req;
    console.log("create comment");
    try {
      await Blog.findOneAndUpdate(
        { slug: slug },
        {
          $push: {
            comments: {
              user: new mongoose.Types.ObjectId(uid),
              content,
            },
          },
        },
        { new: true }
      );

      res.status(201).json({
        ok: true,
        comment: {
          user: new mongoose.Types.ObjectId(uid),
          content,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  },
};

export const createResponse = {
  do: async (req, res, next) => {
    const { slug, content, commentId } = req.body;
    const { uid } = req;
    console.log("create response", commentId);
    try {
      await Blog.findOneAndUpdate(
        { slug: slug },
        {
          $push: {
            "comments.$[element].responses": {
              user: new mongoose.Types.ObjectId(uid),
              content,
            },
          },
        },
        {
          arrayFilters: [
            { "element._id": new mongoose.Types.ObjectId(commentId) },
          ],
        },
        { new: true }
      );

      res.status(201).json({
        ok: true,
        response: {
          user: new mongoose.Types.ObjectId(uid),
          content,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  },
};
