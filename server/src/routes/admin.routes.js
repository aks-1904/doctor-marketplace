import express from "express";
import {
  blockUser,
  unblockUser,
  updateVerificationStatusDoctor,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/update-verification-status", updateVerificationStatusDoctor);
router.post("/block", blockUser);
router.post("/unblock", unblockUser);

export default router;
