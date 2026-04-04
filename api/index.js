const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Parse allowed origins from environment variable
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim());

// HTTPS enforcement middleware (for production)
const httpsEnforcement = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    console.log(process.env.NODE_ENV, 'dev_environment')
    return res.status(403).json({ message: 'HTTPS required' });
  }
  next();
};

app.use(httpsEnforcement);

const blogRoutes = require("./routes/blogs");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/user");
const subscriptionRoutes = require("./routes/subscribe");
const passwordRoutes = require("./routes/password")

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set!");
  process.exit(1);
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
    });
    console.log("MongoDB connected successfully in prod");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error.name === "MongoNetworkError") {
      console.error(
        "Network error. Ensure your IP whitelist includes 0.0.0.0/0."
      );
    } else if (error.name === "MongoParseError") {
      console.error("URI parse error. Check the format of your MongoDB URI.");
    } else {
      console.error("General error:", error);
    }
    process.exit(1);
  }
};

connectToDatabase();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(bodyParser.json());
//app.use("/images", express.static(path.join("api/images")));

app.use((req, res, next) => {
  // Check if origin is in the whitelist
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  // Ensure all necessary headers are included
  res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, isAdmin"
  );
  
  // Include OPTIONS method explicitly
  res.setHeader("Access-Control-Allow-Methods", 
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );

  // Credentials support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/password", passwordRoutes)
app.use("/api/user", userRoutes);
app.use("/api", subscriptionRoutes);

module.exports = app;
