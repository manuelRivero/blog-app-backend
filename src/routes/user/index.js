import {Router} from "express";
import { getProfile, updateProfile } from "../../controllers/user/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";


const router = Router();


router.post('/update-profile', validateJWT, updateProfile.do)
router.get('/profile/:slug', getProfile.do)

export default router