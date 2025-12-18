import express from "express";
import { uplaodLicense } from "../middlewares/multer.middleware.js";
import { login, register } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", uplaodLicense.single("licenseDocument"), register);
router.post("/login", login);

export default router;
