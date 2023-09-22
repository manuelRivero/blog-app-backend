import {Router} from "express";
import { createCategory, getCategories } from "../../controllers/category/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";


const router = Router();


router.post('/',validateJWT, createCategory.check, createCategory.do)
router.get('/', getCategories.do)

export default router