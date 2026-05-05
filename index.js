const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // ✅ VERY IMPORTANT

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());

app.use(
    cors({}),
);


/* ---------- ROUTES ---------- */
const routes = require("./routes/todo");
const authRoutes = require("./routes/user");
/* ---------- MONGODB CONNECTION (CACHED) ---------- */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) { // this is used for caching the database connection
        cached.promise = mongoose
            .connect(process.env.MONGO_URL)
            .then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected");
    return cached.conn;
}

// connect on first request
connectDB();

/* ---------- ROUTES ---------- */
app.use("/todo", routes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("🚀 Server is online");
});

/* ---------- EXPORT (NO app.listen) ---------- */
module.exports = app;
