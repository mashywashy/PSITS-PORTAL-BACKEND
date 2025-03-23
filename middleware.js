import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Request Logger Middleware
export const requestLogger = (req, res, next) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url}`);
  next();
};

// Password Hashing Middleware
export const hashPassword = async (req, res, next) => {
  try {
    if (req.body.password) {
      const saltRounds = 10; 
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    next(); 
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const authenticateJWT = (req, res, next) => {
  // Log the incoming cookies
  console.log("Cookies in request:", req.cookies);

  // Extract the token from the cookie
  const token = req.cookies?.token; // Assuming the token is stored in a cookie named "token"

  if (token) {
    console.log("Token found in cookies:", token); // Debug log
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      console.log("Decoded JWT User:", user); // Debug log
      req.user = user; // Attach the decoded user info to the request
      next();
    });
  } else {
    console.error("Token missing in cookies"); // Debug log
    res.status(401).json({ message: "Unauthorized: Token missing" });
  }
};