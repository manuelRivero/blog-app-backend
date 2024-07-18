import { Router } from "express";

import { validateJWT } from "../../middleware/validateJWT/index.js";
import {
  blogDetail,
  blogLike,
  byCategory,
  comments,
  createBlog,
  createComment,
  createResponse,
  deleteBlog,
  editBlog,
  findBy,
  getBlogs,
  getBlogsCategory,
  otherUserBlogs,
  popular,
  recent,
  responses,
  support,
  userBlogs,
} from "../../controllers/blogs/index.js";

const router = Router();

router.get("/comments", comments.do);
router.get("/responses", responses.do);
router.post("/create-response",validateJWT, createResponse.do);
router.post("/create-comment", validateJWT, createComment.do);
router.post("/create", validateJWT, createBlog.do);
router.get("/category", getBlogsCategory.do)
router.get("/find", findBy.do)
router.get("/popular", popular.do)
router.get("/recent", recent.do)
router.get("/support", support.do)
router.get('/by-category', byCategory.do)
router.post("/edit/:id", validateJWT, editBlog.do);
router.get("/like/:slug",validateJWT, blogLike.do);
router.get("/user-blogs/:id", validateJWT, userBlogs.do)
router.get("/other-user-blogs/:slug", otherUserBlogs.do)
router.delete("/delete/:id", validateJWT, deleteBlog.do)
router.get("/:slug", blogDetail.do);
router.get("/", getBlogs.do)


export default router;
