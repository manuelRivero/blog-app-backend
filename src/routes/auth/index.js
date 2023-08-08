import {Router} from "express";
import { register } from "../../controllers/auth/index.js";


const router = Router();


router.post('/register', register.check, register.do)

export default router