import { Router } from "express";
import {
  login,
  me,
  register,
  refreshTokenFunc,
  setDeviceId,
   //message,
  
} from "../../controllers/auth/index.js";
import { validateJWT } from "../../middleware/validateJWT/index.js";

const router = Router();

router.post("/register", register.check, register.do);
router.post("/login", login.check, login.do);
router.get("/me", validateJWT, me.do);
router.post("/refresh-token", refreshTokenFunc.do);
router.post("/device-id", setDeviceId.do);

export default router;
