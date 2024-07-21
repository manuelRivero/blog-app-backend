import {Router} from "express";
import { fallow, getProfile, unFallow, updateProfile } from "../../controllers/user/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";


const router = Router();


router.post('/update-profile', validateJWT, updateProfile.do)
router.get('/profile/:slug', getProfile.do)
router.post('/follow/',validateJWT, fallow.do)
router.post('/unfollow/',validateJWT, unFallow.do)

export default router