import {Router} from "express";
import { getNotifications } from "../../controllers/notification/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";


const router = Router();


router.get('/get',validateJWT, getNotifications.do)

export default router