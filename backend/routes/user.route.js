import express from "express";
import { body, param } from "express-validator";
import { protectRoute } from "../middleware/protectRoute.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser, getFollowersList, getFollowingList } from "../controllers/user.controller.js";

const router = express.Router();

const followValidation = [
	param("id").isMongoId().withMessage("Invalid user id format"),
];

const updateValidation = [
	body("email").optional({ checkFalsy: true }).isEmail().withMessage("Email must be valid"),
	body("username").optional({ checkFalsy: true }).isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
	body("fullName").optional({ checkFalsy: true }).isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),
	body("newPassword").optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/followers/:username", protectRoute, getFollowersList);
router.get("/following/:username", protectRoute, getFollowingList);
router.post("/follow/:id", protectRoute, followValidation, validateRequest, followUnfollowUser);
router.post("/update", protectRoute, updateValidation, validateRequest, updateUser);

export default router;
