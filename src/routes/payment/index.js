import {Router} from "express";
import { validateJWT } from "../../middleware/validateJWT/index.js";
import { createAccessToken, createPreference } from "../../controllers/payment/index.js";

const router = Router();

router.post('/',validateJWT, createPreference.do)
router.post('/access',createAccessToken.do)

export default router