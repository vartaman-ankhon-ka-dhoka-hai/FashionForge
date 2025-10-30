import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { 
  requestOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  insertProductSchema,
  insertOrderSchema,
  insertAddressSchema,
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
    const user = jwt.verify(token, JWT_SECRET) as any;
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

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via console (replace with Twilio in production)
function sendOtp(phone: string, otp: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📱 OTP for ${phone}: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`${'='.repeat(60)}\n`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== AUTH ROUTES ====================
  
  // Request OTP
  app.post("/api/auth/request-otp", 
    [
      body("phone").matches(/^\+91[0-9]{10}$/).withMessage("Invalid Indian phone number format"),
      validateRequest
    ],
    async (req: Request, res: Response) => {
    try {
      const validatedData = requestOtpSchema.parse(req.body);
      
      // Check if user exists, create if not
      let user = await storage.getUserByPhone(validatedData.phone);
      if (!user) {
        user = await storage.createUser(validatedData.phone);
      }

      // Generate and store OTP
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await storage.updateUserOtp(validatedData.phone, otp, expiresAt);
      
      // Send OTP (console for now, Twilio later)
      sendOtp(validatedData.phone, otp);

      res.json({ 
        message: "OTP sent successfully",
        phone: validatedData.phone
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Verify OTP and login
  app.post("/api/auth/verify-otp", 
    [
      body("phone").matches(/^\+91[0-9]{10}$/).withMessage("Invalid Indian phone number format"),
      body("otpCode").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
      validateRequest
    ],
    async (req: Request, res: Response) => {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      
      // Verify OTP
      const user = await storage.verifyAndClearOtp(validatedData.phone, validatedData.otpCode);
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, phone: user.phone, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      // Return user and token
      const { otpCode, otpExpiresAt, otpAttempts, ...userWithoutOtp } = user;
      res.json({ user: userWithoutOtp, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "OTP verification failed" });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(req.user.id, validatedData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { otpCode, otpExpiresAt, otpAttempts, ...userWithoutOtp } = user;
      res.json(userWithoutOtp);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { otpCode, otpExpiresAt, otpAttempts, ...userWithoutOtp } = user;
      res.json(userWithoutOtp);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== ADDRESS ROUTES ====================
  
  // Get user's addresses
  app.get("/api/addresses", authenticateToken, async (req: any, res) => {
    try {
      const addresses = await storage.getUserAddresses(req.user.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create address
  app.post("/api/addresses", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(req.user.id, validatedData);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create address" });
    }
  });

  // Update address
  app.patch("/api/addresses/:id", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(req.params.id, validatedData);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update address" });
    }
  });

  // Delete address
  app.delete("/api/addresses/:id", authenticateToken, async (req: any, res) => {
    try {
      const success = await storage.deleteAddress(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Set default address
  app.post("/api/addresses/:id/set-default", authenticateToken, async (req: any, res) => {
    try {
      await storage.setDefaultAddress(req.user.id, req.params.id);
      res.json({ message: "Default address updated" });
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
  app.get("/api/admin/orders", authenticateToken, requireAdmin, async (req: any, res) => {
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
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  // Update order status (admin only)
  app.patch("/api/admin/orders/:id/status", authenticateToken, requireAdmin, async (req: any, res) => {
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
      res.status(400).json({ message: error.message || "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
