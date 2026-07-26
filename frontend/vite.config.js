import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 3000,
		strictPort: true,
		proxy: {
			"/api": {
				target: "http://localhost:5002",
				changeOrigin: true,
			},
		},
	},
});
