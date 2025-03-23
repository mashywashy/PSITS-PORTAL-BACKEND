import express from 'express';
import { signUp, login, verifyMembership, logout } from './controller.js';
import { hashPassword, authenticateJWT } from './middleware.js';

const router = express.Router();

router.post("/signup", hashPassword, signUp);
router.post("/login", login);
router.post("/verify", authenticateJWT, verifyMembership);
router.post("/logout", logout);

export default router;