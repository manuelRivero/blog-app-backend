import { Router } from "express";

import { validateJWT } from "../../middleware/validateJWT/index.js";
import {
  blogDetail,
  comments,
  createBlog,
  createComment,
  createResponse,
  responses,
} from "../../controllers/blogs/index.js";

const router = Router();

router.get("/comments", comments.do);
router.get("/responses", responses.do);
router.post("/create-response",validateJWT, createResponse.do);
router.post("/create-comment", validateJWT, createComment.do);
router.post("/create", validateJWT, createBlog.do);
router.get("/:slug", blogDetail.do);

export default router;
