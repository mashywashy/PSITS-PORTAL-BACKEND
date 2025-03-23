import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './schema.js';

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure key in production

// Sign-Up Controller
export const signUp = async (req, res) => {
  const { firstName, lastName, email, password, role, studentId } = req.body;

  try {
    console.log("Sign-Up Process Started");

    // Check if the user already exists
    console.log("Checking if user already exists...");
    const existingUser = await User.findOne({ studentId });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    console.log("Creating new user...");
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      email,
      password,
      studentId, // Password is already hashed by the hashPassword middleware
      role,
    });

    console.log("Saving new user to the database...");
    await newUser.save(); // Save the user to the database
    console.log("User created successfully");
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    console.log("Login Process Started");

    // Find the user in the database
    const user = await User.findOne({ studentId });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid student ID or password" });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Password does not match");
      return res.status(401).json({ message: "Invalid student ID or password" });
    }

    // Prepare the payload for the JWT token
    const payload = {
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevents CSRF attacks
    });

    console.log("Login successful");
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify Membership Controller
export const verifyMembership = async (req, res) => {
  const { studentId } = req.body;

  try {
    console.log("Membership Verification Process Started");

    // Log the authenticated user data
    console.log("Authenticated User Data:", req.user);

    // Extract the role from the authenticated user
    console.log("Extracting role from authenticated user...");
    const currentUserRole = req.user.role; // `req.user` is populated by JWT middleware

    // Check if the current user is an officer
    console.log("Checking if the current user is an officer...");
    if (currentUserRole !== 'officer') {
      console.log("Access denied. User is not an officer");
      return res.status(403).json({ message: "Access denied. Only officers can verify memberships." });
    }

    // Find the user in the database by studentId
    console.log("Finding user in the database by studentId...");
    const user = await User.findOne({ studentId });
    if (!user) {
      console.log("User with the provided student ID not found");
      return res.status(401).json({ message: "Invalid student ID" });
    }

    // Check if the membership is already verified
    console.log("Checking if membership is already verified...");
    if (user.isVerified) {
      console.log("Membership is already verified");
      return res.status(200).json({ message: "Membership already verified" });
    } else {
      // Verify the membership
      console.log("Verifying membership...");
      user.isVerified = true;
      await user.save();
      console.log("Membership verified successfully");
      return res.status(200).json({ message: "Membership verified" });
    }
  } catch (error) {
    console.error("Error during membership verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    console.log("Logout Process Started");

    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true, // Ensure the cookie cannot be accessed via client-side JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
    });

    console.log("User logged out successfully");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};