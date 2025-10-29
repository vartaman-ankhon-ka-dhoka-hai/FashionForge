import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { 
  insertUserSchema, 
  loginSchema, 
  insertProductSchema, 
  insertOrderSchema,
  type User 
} from "@shared/schema";

function validateRequest(req: any, res: any, next: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

// In development, use a default secret. In production, require it to be set.
const JWT_SECRET = process.env.JWT_SECRET || 
  (process.env.NODE_ENV === "development" 
    ? "dev-secret-DO-NOT-USE-IN-PRODUCTION" 
    : (() => { throw new Error("JWT_SECRET environment variable is required in production"); })());

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as User;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// Middleware to verify admin access
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== AUTH ROUTES ====================
  
  // Register new user
  app.post("/api/auth/register", 
    [
      body("email").isEmail().normalizeEmail().trim().escape(),
      body("password").isLength({ min: 6 }).trim(),
      body("name").isLength({ min: 2, max: 100 }).trim().escape(),
      body("phone").optional().trim().escape(),
      validateRequest
    ],
    async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password with 12 salt rounds for better security
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login user
  app.post("/api/auth/login", 
    [
      body("email").isEmail().normalizeEmail().trim().escape(),
      body("password").notEmpty().trim(),
      validateRequest
    ],
    async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PRODUCT ROUTES ====================
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create product (admin only)
  app.post("/api/products", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  // Update product (admin only)
  app.patch("/api/products/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== ORDER ROUTES ====================
  
  // Get user's orders
  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all orders (admin only)
  app.get("/api/orders/all", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create order
  app.post("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const order = await storage.createOrder({
        ...validatedData,
        userId: req.user.id,
      });
      
      // TODO: Integrate Stripe/Razorpay payment processing here
      // For now, orders are created with "pending" payment status
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  // Update order status (admin only)
  app.patch("/api/orders/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== STRIPE PAYMENT PLACEHOLDER ====================
  
  // TODO: Integrate Stripe payment processing
  // Placeholder for future Stripe integration
  app.post("/api/create-payment-intent", authenticateToken, async (req: any, res) => {
    try {
      // TODO: Implement Stripe payment intent creation
      // const { amount } = req.body;
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(amount * 100),
      //   currency: "usd",
      // });
      // res.json({ clientSecret: paymentIntent.client_secret });
      
      res.status(501).json({ 
        message: "Payment integration not yet implemented. Please add Stripe/Razorpay API keys." 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
