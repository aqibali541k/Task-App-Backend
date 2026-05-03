const express = require("express");
const app = express();
require("dotenv").config();

const cors = require("cors");
const mongoose = require("mongoose");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const routes = require("./routes/todo");
const authRoutes = require("./routes/user");
app.use("/todo", routes);
app.use("/auth", authRoutes);

// Port
const PORT = process.env.PORT || 5000;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
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

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
