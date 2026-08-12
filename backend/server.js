import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from 'url';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploaded images are stored locally and served as static files
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000").split(",");
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
});
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy: false,}));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true, limit: "5mb" })); // to parse form data(urlencoded)

app.use(cookieParser());
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/api/auth", authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/posts", apiLimiter, postRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
	});
}
export default app;
/*
if (process.env.NODE_ENV !== 'production') {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
		connectMongoDB();
	});
} else {
	connectMongoDB();
}
*/

connectMongoDB();

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
