import {Router} from "express";
import { updateSocial } from "../../controllers/user/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";


const router = Router();


router.post('/update-social', validateJWT, updateSocial.do)

export default router