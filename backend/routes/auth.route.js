import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { getMe, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: { error: "Too many auth requests. Please try again later." },
	standardHeaders: true,
});

const signupValidation = [
	body("email").isEmail().withMessage("Email must be valid"),
	body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
	body("fullName").isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),
	body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
	body("username").notEmpty().withMessage("Username is required"),
	body("password").notEmpty().withMessage("Password is required"),
];

router.get("/me", protectRoute, getMe);
router.post("/signup", authLimiter, signupValidation, validateRequest, signup);
router.post("/login", authLimiter, loginValidation, validateRequest, login);
router.post("/logout", logout);

export default router;
