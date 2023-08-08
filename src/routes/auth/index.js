import {Router} from "express";
import { login, register } from "../../controllers/auth/index.js";


const router = Router();


router.post('/register', register.check, register.do)
router.post('/login', login.check, login.do)

export default router