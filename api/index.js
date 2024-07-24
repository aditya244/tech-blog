const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

const blogRoutes = require("./routes/blogs");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/user");
const subscriptionRoutes = require("./routes/subscribe")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aditya:V53bkdhA4QHBKB9U@cluster0.eciv35m.mongodb.net/blog?retryWrites=true&w=majority"

// mongoose.connect(MONGODB_URI)
//     .then(() => {
//         console.log('Connected to database');
//     })
//     .catch(() => {
//         console.log(MONGODB_URI)
//         console.log('Connection to database failed');
//     })




    const connectToDatabase = async () => {
        try {
          await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 30000,  // 30 seconds
            socketTimeoutMS: 30000   // 30 seconds
          });
          console.log('MongoDB connected successfully');
        } catch (error) {
          console.error('MongoDB connection failed:', error.message);
          if (error.name === 'MongoNetworkError') {
            console.error('Network error. Ensure your IP whitelist includes 0.0.0.0/0.');
          } else if (error.name === 'MongoParseError') {
            console.error('URI parse error. Check the format of your MongoDB URI.');
          } else {
            console.error('General error:', error);
          }
          process.exit(1);
        }
      };
      
      connectToDatabase();
      
      const db = mongoose.connection;
      db.on('error', console.error.bind(console, 'MongoDB connection error:'));
      db.once('open', () => {
        console.log('Connected to MongoDB');
      });



app.use(bodyParser.json());
//app.use("/images", express.static(path.join("api/images")));
const imagePath = path.join(__dirname, 'api', 'images');
console.log('Serving images from path:', imagePath);
app.use("/images", express.static(imagePath));

console.log('loading image')
//app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, isAdmin"
    );
    res.setHeader("Access-Control-Allow-Methods", 
        "GET, POST, PATCH, DELETE, OPTIONS, PUT"
    );
    next();
})

app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/user", userRoutes)
app.use("/api", subscriptionRoutes)

module.exports = app;