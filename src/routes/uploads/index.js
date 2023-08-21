import {Router} from "express";
import { validateJWT } from "../../middleware/validateJWT/index.js";
import { uploadImage } from "../../controllers/uploads/index.js";


const router = Router();


router.post('/upload-image', validateJWT, uploadImage.do)

export default router