import {Router} from "express";
import { getProfile, updateSocial } from "../../controllers/user/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";


const router = Router();


router.post('/update-social', validateJWT, updateSocial.do)
router.get('/profile/:slug', getProfile.do)

export default router