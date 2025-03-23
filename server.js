import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './router.js'; // Import the router
import { requestLogger } from './middleware.js'; // Import middlewares

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(requestLogger); // Use the request logger middleware
app.use(cookieParser()); // Use the cookie parser middleware

const CONNECTION_STRING = process.env.CONNECTION_STRING;

// Connect to MongoDB
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Use the router
app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});