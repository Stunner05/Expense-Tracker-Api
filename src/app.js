const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose"); // <-- you forgot to import
const routes = require("./routes/index");

const app = express();

// quick test routes
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/ping", (req, res) => res.json({ message: "pong" }));
app.get("/api/test", (req, res) => res.json({ ok: true }));
app.get("/api/test/hello", (req, res) => res.json({ ok: true }));

// security & middleware
app.use(
	cors({
		// origin: config.frontend_uri,  <-- add this if you want to restrict CORS
		methods: ["GET", "PATCH", "PUT", "POST", "DELETE"],
	})
);
app.use(helmet());
app.use(express.json({ limit: "2000kb" }));

// ✅ database connection helper
let isConnected = false;

async function connectDB() {
	if (isConnected) return; // don't reconnect if already connected

	try {
		const db = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		isConnected = db.connections[0].readyState === 1;
		console.log("✅ Database connected");
	} catch (error) {
		isConnected = false;
		console.error("❌ Database connection failed", error);
		throw error;
	}
}

// ✅ middleware: ensure DB is connected before handling requests
app.use(async (req, res, next) => {
	try {
		await connectDB();
		next();
	} catch {
		return res.status(500).json({ error: "Database not available" });
	}
});

// request logger
app.use((req, res, next) => {
	console.log(req.method, req.path);
	next();
});

// routes
app.use("/api", routes);

module.exports = app;
