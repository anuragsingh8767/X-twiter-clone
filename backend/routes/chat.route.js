import express from "express";
import { body, param } from "express-validator";

import { getChats, getMessages, sendMessage } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();
const userIdValidation = [param("userId").isMongoId().withMessage("Invalid user id format")];
const messageValidation = [body("text").isString().trim().isLength({ min: 1, max: 2000 }).withMessage("Message must be 1-2000 characters")];

router.get("/", protectRoute, getChats);
router.get("/:userId/messages", protectRoute, userIdValidation, validateRequest, getMessages);
router.post("/:userId/messages", protectRoute, [...userIdValidation, ...messageValidation], validateRequest, sendMessage);

export default router;