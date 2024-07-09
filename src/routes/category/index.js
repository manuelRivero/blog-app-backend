import {Router} from "express";
import { createCategory, getAllCategories, getCategories } from "../../controllers/category/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";
import { byCategory } from "../../controllers/blogs/index.js";


const router = Router();


router.post('/',validateJWT, createCategory.check, createCategory.do)
router.get('/', getCategories.do)
router.get('/get-all', getAllCategories.do)

export default router