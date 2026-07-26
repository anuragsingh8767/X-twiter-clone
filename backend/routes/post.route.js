import express from "express";
import { body, param } from "express-validator";
import { protectRoute } from "../middleware/protectRoute.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
	commentOnPost,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();

const createPostValidation = [
	body("text").optional().isString().isLength({ max: 280 }).withMessage("Text must be max 280 characters"),
	body("img").optional().isString().withMessage("Image must be a valid string URL or base64 string"),
];

const idValidation = [
	param("id").isMongoId().withMessage("Invalid id format"),
];

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, idValidation, validateRequest, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPostValidation, validateRequest, createPost);
router.post("/like/:id", protectRoute, idValidation, validateRequest, likeUnlikePost);
router.post("/comment/:id", protectRoute, idValidation, validateRequest, commentOnPost);
router.delete("/:id", protectRoute, idValidation, validateRequest, deletePost);

export default router;
