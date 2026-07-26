import mongoose from "mongoose";

const connectMongoDB = async () => {
	if (!process.env.MONGO_URI) {
		console.error("MongoDB connection skipped: MONGO_URI is not defined.");
		return false;
	}

	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${conn.connection.host}`);
		return true;
	} catch (error) {
		console.error(`MongoDB connection failed: ${error.message}`);
		return false;
	}
};

export default connectMongoDB;
