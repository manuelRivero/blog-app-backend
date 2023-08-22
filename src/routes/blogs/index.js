import { Router } from "express";

import { validateJWT } from "../../middleware/validateJWT/index.js";
import {
  blogDetail,
  comments,
  createBlog,
  createComment,
} from "../../controllers/blogs/index.js";

const router = Router();

router.get("/comments", comments.do);
router.post("/create-comment", createComment.do);
router.post("/create", validateJWT, createBlog.do);
router.get("/:slug", blogDetail.do);

export default router;
