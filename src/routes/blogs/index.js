import { Router } from "express";

import { validateJWT } from "../../middleware/validateJWT/index.js";
import { blogDetail, createBlog } from "../../controllers/blogs/index.js";

const router = Router();

router.get("/:slug", validateJWT, blogDetail.do);
router.post("/create", validateJWT, createBlog.do);

export default router;
