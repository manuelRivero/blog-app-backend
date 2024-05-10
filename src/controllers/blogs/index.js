import Blog from "../../models/blog.js";
import User from "../../models/user.js";
import fs from "fs";
import cloudinary from "../../helpers/imageUpload/index.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";

export const createBlog = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { title, description, content, category } = req.body;
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
      category,
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

export const editBlog = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { title, description, content, category } = req.body;
    const { id } = req.params;
    const { files } = req;
    const { uid } = req;
    const targetBlog = await Blog.findById(id);
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

    const targetSlugCount = await Blog.find({
      slug: `${urlFriendlySlug}`,
    }).count();

    if (targetSlugCount > 0) {
      targetBlog.slug = `${urlFriendlySlug}.${targetSlugCount + 1}`;
    } else {
      targetBlog.slug = `${urlFriendlySlug}`;
    }
    if (files) {
      try {
        const imageUrl = await cloudinary.uploader.upload(
          files.image.tempFilePath,
          { folder: "blogs-uploads" }
        );
        console.log("imageUrl.secure_url", imageUrl.secure_url);
        targetBlog.image = imageUrl.secure_url;
      } catch (error) {
        res
          .status(400)
          .json({ ok: false, error: "Error al subir la imagen del blog" });
        console.log("Error al subir la imagen del blog", error);
      }
    }

    try {
      (targetBlog.title = title),
        (targetBlog.description = description),
        (targetBlog.content = content),
        (targetBlog.category = category),
        await targetBlog.save();
      if (files && files.image) {
        fs.unlinkSync(files.image.tempFilePath);
      }
      res.status(201).json({
        ok: true,
        blog: targetBlog,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error,
      });
      if (files && files.image) {
        fs.unlinkSync(files.image.tempFilePath);
      }
    }
  },
};

export const userBlogs = {
  do: async (req, res) => {
    const { page = 0 } = req.query;
    const { uid } = req;
    const pageSize = 10;
    const blogs = await Blog.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(uid),
          isDelete: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 },
          content: { $first: "$content" },
          description: { $first: "$description" },
          category: { $first: "$category" },
          targetUser: { $first: "$user" },
          image: { $first: "$image" },
          slug: { $first: "$slug" },
        }
      },
        {
          $group: {
            _id: "$_id",
            count: { $sum: 1 },
            content: { $first: "$content" },
            description: { $first: "$description" },
            category: { $first: "$category" },
            targetUser: { $first: "$user" },
            image: { $first: "$image" },
            slug: { $first: "$slug" },
            title: {$first:"$title"}
          },
        },
      {
        $lookup: {
          from: "users",
          localField: "targetUser",
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
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
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

    console.log("user blogs", blogs);
    res.json({
      ok: true,
      blogs,
    });
  },
};
export const blogDetail = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { slug } = req.params;
    const { token } = req.cookies;
    console.log("token");

    try {
      const targetBlog = await Blog.findOne({ slug: slug })
        .select(" -comments")
        .populate("user", " avatar slug name lastName")
        .populate("category", "name");
      if (!targetBlog) {
        res.status(404).json({
          ok: false,
          error: "Blog no encontrado",
        });
      } else {
        let targetLike = null;
        if (token) {
          const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
          targetLike = targetBlog.likes.find((like) => {
            console.log(" like data ", like.user.toString(), uid);
            return like.user.toString() === uid;
          });
        }
        console.log("taget like", targetLike);
        res.json({
          blog: {
            ...targetBlog._doc,
            targetLike: targetLike ? true : false,
          },
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

export const blogLike = {
  check: (req, res, next) => {},
  do: async (req, res, next) => {
    const { slug } = req.params;
    const { uid } = req;
    const likeId = new mongoose.Types.ObjectId();

    try {
      const targetBlog = await Blog.findOne({ slug: slug });

      const alreadyLike = targetBlog.likes.some(
        (e) => e.user.toString() === uid
      );
      console.log("alredady like", alreadyLike);
      if (alreadyLike) {
        targetBlog.likes = targetBlog.likes.filter(
          (e) => e.user.toString() !== uid
        );
        await targetBlog.save();
      } else {
        targetBlog.likes.push({
          user: new mongoose.Types.ObjectId(uid),
          _id: likeId,
        });
        await targetBlog.save();
      }

      res.json({
        blog: {
          ok: true,
        },
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: "Error al dar me gusta en el blog",
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
            createdAt: { $first: "$comments.createdAt" },
            user: { $first: "$comments.user" },
            content: { $first: "$comments.content" },
          },
        },
        { $sort: { createdAt: -1 } },
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
            createdAt: { $first: "$comments.createdAt" },
            user: { $first: "$comments.user" },
            content: { $first: "$comments.content" },
            responses: { $first: "$comments.responses" },
          },
        },
        {
          $match: { _id: new mongoose.Types.ObjectId(commentId) },
        },
        { $unwind: "$responses" },
        {
          $group: {
            _id: "$responses._id",
            // createAt: { $first: "$comments.createdAt" },
            user: { $first: "$responses.user" },
            content: { $first: "$responses.content" },
            createdAt: { $first: "$responses.createdAt" },
          },
        },
        { $sort: { createdAt: -1 } },
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
    //const {deviceId} = req
    const commentId = new mongoose.Types.ObjectId();
    console.log("create comment");
    try {
      const blog = await Blog.findOneAndUpdate(
        { slug: slug },
        {
          $push: {
            comments: {
              _id: commentId,
              user: new mongoose.Types.ObjectId(uid),
              content,
            },
          },
        },
        { new: true }
      );
      const targetUserCommet = await User.findById(uid);
      const targetUser = await User.findById(blog.user);
      console.log("creador del comentario ", targetUserCommet);
      console.log("creador del blog",targetUser );
      console.log("id creador del blog", targetUser._id.toString());
      console.log("blog slug", blog.slug);
      console.log("blog title", blog.title);
      console.log("nombre creador del comentario", targetUserCommet.name);
      
      
      const messaje = {
        notification: {
          title: `Nuevo comentario`,
          body: `${targetUserCommet.name} a comentado tu blog ${blog.title}`,
        },data:{
          idUserBlog: targetUser._id.toString(),
          nameUserComment: targetUserCommet.name,
          slugBlog: blog.slug,
          titleBlog: blog.title,
          type: "comment"
        },
        token: targetUser.notificationId,
      };
      await admin.messaging().send(messaje);
      // .then((response) => {
      //   res.status(200).json({
      //     messaje: "mensaje enviado 1",
      //     //token: receivedToken
      //   });
      //   console.log("mensaje enviado 2", response);
      // })
      // .catch((error) => {
      //   res.status(400);
      //   res.send(error);
      //   console.log("error al enviar el mensaje", error);
      // });

      const targetComment = await Blog.aggregate([
        {
          $match: { slug: slug },
        },
        { $unwind: "$comments" },
        { $match: { "comments._id": commentId } },

        {
          $project: {
            comments: 1,
            _id: -1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.user",
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
      ]);

      res.status(201).json({
        ok: true,
        comment: targetComment,
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

    const responseId = new mongoose.Types.ObjectId();
    console.log("commentId", commentId);
    try {
      const response = await Blog.findOneAndUpdate(
        { slug: slug },
        {
          $push: {
            "comments.$[element].responses": {
              _id: responseId,
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
        { new: true, timestamps: true }
      );
      const targetResponse = await Blog.aggregate([
        {
          $match: { slug: slug },
        },
        { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } },
        { $match: { "comments._id": new mongoose.Types.ObjectId(commentId) } },
        {
          $project: {
            comments: 1,
            _id: -1,
          },
        },
        {
          $unwind: {
            path: "$comments.responses",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: { "comments.responses._id": responseId } },

        {
          $project: {
            "comments.responses": 1,
            _id: -1,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "comments.responses.user",
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
      ]);
      console.log("target response", targetResponse);
      res.status(201).json({
        ok: true,
        data: targetResponse,
      });
    } catch (error) {
      console.log("error", error);
    }
  },
};

export const getBlogs = {
  do: async (req, res) => {
    const { page = 0, search } = req.params;
    //const { uid } = req;
    const pageSize = 10;
    const blogs = await Blog.aggregate([
      {
        $match: { isDelete: { $ne: true } },
      },
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 },
          createdAt: { $first: "$createdAt" },
          user: { $first: "$user" },
          description: { $first: "$description" },
          title: { $first: "$title" },
          category: { $first: "$category" },
          image: { $first: "$image" },
          slug: { $first: "$slug" },
        },
      },
      { $sort: { createdAt: -1 } },
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
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
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

    console.log("blogs", blogs[0]);

    res.json({
      ok: true,
      blogs,
    });
  },
};

export const getBlogsCategory = {
  do: async (req, res) => {
    const { page = 0, categoryId } = req.query;
    console.log("category id", categoryId);
    const pageSize = 10;
    const responseId = new mongoose.Types.ObjectId();
    const blogs = await Blog.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
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
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
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
    console.log("blogsCategory", blogs);

    res.json({
      ok: true,
      blogs,
    });
  },
};

export const deleteBlog = {
  do: async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({
        ok: false,
        error: "Blog no encontrado",
      });
    } else {
      blog.isDelete = true;
      await blog.save();
      res.json({
        ok: true,
        blog,
      });
    }
  },
};
export const otherUserBlogs = {
  do: async (req, res) => {
    const { page = 0 } = req.query;
    const { slug } = req.params;
    const pageSize = 10;

    const targetUser = await User.findOne({ slug });

    console.log("controller blogsssss ", targetUser);

    if (!targetUser) {
      return res.status(404).json({
        error: "Ususario no encontrado",
        ok: false,
      });
    }

    const blogs = await Blog.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(targetUser._id),
          isDelete: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 },
          title: { $first: "$title" },
          content: { $first: "$content" },
          description: { $first: "$description" },
          category: { $first: "$category" },
          targetUser: { $first: "$user" },
          image: { $first: "$image" },
          slug: { $first: "$slug" },
          title: {$first: "$title"}
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "targetUser",
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
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
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

    console.log("user blogs", blogs);
    res.json({
      ok: true,
      blogs,
    });
  },
};
