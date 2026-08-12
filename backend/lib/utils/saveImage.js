import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory: /app/uploads in Docker, or <project-root>/uploads locally
const UPLOADS_DIR = path.resolve(__dirname, "../../../../uploads");

// Ensure the uploads directory exists on startup
if (!fs.existsSync(UPLOADS_DIR)) {
	fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Saves a base64-encoded image string to disk.
 * @param {string} base64String  - Raw base64 or data URL (data:image/jpeg;base64,...)
 * @returns {string}             - Public URL path, e.g. /uploads/abc123.jpg
 */
export const saveImage = (base64String) => {
	// Strip the data URL prefix and detect mime type
	const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);

	let ext = "jpg";
	let data = base64String;

	if (matches) {
		ext = matches[1] === "jpeg" ? "jpg" : matches[1];
		data = matches[2];
	}

	const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
	const filepath = path.join(UPLOADS_DIR, filename);

	fs.writeFileSync(filepath, Buffer.from(data, "base64"));

	return `/uploads/${filename}`;
};

/**
 * Deletes a previously saved image from disk.
 * @param {string} urlPath - The public URL path returned by saveImage, e.g. /uploads/abc123.jpg
 */
export const deleteImage = (urlPath) => {
	if (!urlPath) return;
	try {
		const filename = path.basename(urlPath);
		const filepath = path.join(UPLOADS_DIR, filename);
		if (fs.existsSync(filepath)) {
			fs.unlinkSync(filepath);
		}
	} catch (err) {
		console.error("Failed to delete image:", err.message);
	}
};
