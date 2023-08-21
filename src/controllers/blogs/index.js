import Blog from "../../models/blog.js";
import fs from "fs";
import cloudinary from "../../helpers/imageUpload/index.js";
import mongoose from "mongoose";

export const createBlog = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { title, description, content } = req.body;
    const { files } = req;
    const { uid } = req;
    const specialCharactersRegularExpression = new RegExp(
      specialCharacters.split("").join("|"),
      "g"
    );
    // Special characters and the characters they will be replaced by.
    const specialCharacters = "àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź";
    const replaceCharacters = "aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz";
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

    const targetSlugCount = await User.find({
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
    }
  },
};

export const blogDetail = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { slug } = req.params;
    try {
      const targetBlog = await Blog.findOne({ slug: slug });
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
