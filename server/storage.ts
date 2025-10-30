import { 
  type User, 
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Address,
  type InsertAddress,
  type UpdateProfile,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(phone: string): Promise<User>;
  updateUserProfile(id: string, profile: UpdateProfile): Promise<User | undefined>;
  updateUserOtp(phone: string, otpCode: string, expiresAt: Date): Promise<void>;
  verifyAndClearOtp(phone: string, otpCode: string): Promise<User | null>;
  
  // Address methods
  getUserAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  createAddress(userId: string, address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Order methods
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    
    // Seed initial admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      email: "admin@urbanthread.com",
      password: "$2a$10$rQ0YvK5YQH5YvK5YQH5YvOqK5YQH5YvK5YQH5YvK5YQH5YvK5YQH5Y", // "admin123"
      name: "Admin User",
      phone: null,
      isAdmin: true,
      createdAt: new Date(),
    });
    
    // Seed initial products
    const products = [
      {
        id: randomUUID(),
        name: "Premium Black Hoodie",
        description: "Crafted from premium cotton blend, this oversized black hoodie combines comfort with urban style. Features a relaxed fit, adjustable drawstring hood, and ribbed cuffs for a modern streetwear aesthetic.",
        price: "89.99",
        image: "/attached_assets/generated_images/Black_premium_hoodie_product_194dcf64.png",
        category: "hoodie",
        sizes: ["S", "M", "L", "XL", "XXL"],
        inStock: true,
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Essential White Tee",
        description: "A minimalist wardrobe staple. Our premium white t-shirt is made from 100% organic cotton with a classic crew neck and relaxed fit. Perfect for layering or wearing solo.",
        price: "39.99",
        image: "/attached_assets/generated_images/White_modern_t-shirt_product_97925f47.png",
        category: "tshirt",
        sizes: ["XS", "S", "M", "L", "XL"],
        inStock: true,
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Oversized Gray Hoodie",
        description: "Ultimate comfort meets contemporary design. This oversized hoodie in charcoal gray features dropped shoulders, a spacious kangaroo pocket, and super-soft fleece interior.",
        price: "94.99",
        image: "/attached_assets/generated_images/Gray_oversized_hoodie_product_cf6d6803.png",
        category: "hoodie",
        sizes: ["M", "L", "XL", "XXL"],
        inStock: true,
        featured: false,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Orange Accent Tee",
        description: "Make a statement with our vibrant orange tee. Premium fabric with a modern cut, designed to add a pop of color to your streetwear collection. Pairs perfectly with neutral bottoms.",
        price: "44.99",
        image: "/attached_assets/generated_images/Orange_accent_t-shirt_product_9ab28447.png",
        category: "tshirt",
        sizes: ["S", "M", "L", "XL"],
        inStock: true,
        featured: true,
        createdAt: new Date(),
      },
    ];
    
    products.forEach(product => {
      this.products.set(product.id, product as any);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      inStock: insertProduct.inStock ?? true,
      featured: insertProduct.featured ?? false,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(
    id: string,
    updates: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated: Product = {
      ...product,
      ...updates,
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updated: Order = {
      ...order,
      status,
    };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
