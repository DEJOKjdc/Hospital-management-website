import express from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import { User } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Extend session data type
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userRole?: string;
  }
}

export const setupAuth = (app: express.Express) => {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "hospital-management-secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Auth middleware to check if user is authenticated
  const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Register user (patient only)
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, fullName, email, phone, address } = req.body;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new patient
      const newUser = await storage.createUser({
        username,
        password,
        role: "patient",
        fullName,
        email,
        phone,
        address,
      });

      // Create patient record
      await storage.createPatient({
        userId: newUser.id,
        medicalHistory: "",
        healthConditions: "",
      });

      // Set session
      req.session.userId = newUser.id;
      req.session.userRole = newUser.role;
      
      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      return res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  return { isAuthenticated };
};
