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
  private addresses: Map<string, Address>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.addresses = new Map();
    this.products = new Map();
    this.orders = new Map();
    
    // Seed initial admin user (phone-based)
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      phone: "+919999999999",
      name: "Admin User",
      email: "admin@madeinpune.com",
      isAdmin: true,
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      createdAt: new Date(),
    });
    
    // Seed initial products
    const products = [
      {
        id: randomUUID(),
        name: "Premium Black Kurta",
        description: "Handcrafted from premium cotton blend, this elegant black kurta combines traditional Indian craftsmanship with modern style. Features a relaxed fit, classic collar, and intricate button details.",
        price: "2499.00",
        image: "/attached_assets/generated_images/Black_premium_hoodie_product_194dcf64.png",
        category: "kurta",
        sizes: ["S", "M", "L", "XL", "XXL"],
        inStock: true,
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Essential White Cotton Shirt",
        description: "A timeless wardrobe essential. Our premium white cotton shirt is made from 100% pure Indian cotton with a classic collar and comfortable fit. Perfect for any occasion.",
        price: "1299.00",
        image: "/attached_assets/generated_images/White_modern_t-shirt_product_97925f47.png",
        category: "shirt",
        sizes: ["XS", "S", "M", "L", "XL"],
        inStock: true,
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Traditional Gray Kurta",
        description: "Ultimate comfort meets traditional design. This kurta in charcoal gray features elegant patterns, a spacious pocket, and soft handwoven fabric.",
        price: "2799.00",
        image: "/attached_assets/generated_images/Gray_oversized_hoodie_product_cf6d6803.png",
        category: "kurta",
        sizes: ["M", "L", "XL", "XXL"],
        inStock: true,
        featured: false,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Vibrant Orange Casual Shirt",
        description: "Make a statement with our vibrant orange shirt. Premium fabric with a modern cut, designed to add a pop of color to your collection. Perfect for festive occasions.",
        price: "1499.00",
        image: "/attached_assets/generated_images/Orange_accent_t-shirt_product_9ab28447.png",
        category: "shirt",
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

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone
    );
  }

  async createUser(phone: string): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      phone,
      name: null,
      email: null,
      isAdmin: false,
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: string, profile: UpdateProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...profile,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserOtp(phone: string, otpCode: string, expiresAt: Date): Promise<void> {
    const user = await this.getUserByPhone(phone);
    if (user) {
      user.otpCode = otpCode;
      user.otpExpiresAt = expiresAt;
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      this.users.set(user.id, user);
    }
  }

  async verifyAndClearOtp(phone: string, otpCode: string): Promise<User | null> {
    const user = await this.getUserByPhone(phone);
    if (!user) return null;
    
    if (user.otpCode === otpCode && user.otpExpiresAt && user.otpExpiresAt > new Date()) {
      user.otpCode = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      this.users.set(user.id, user);
      return user;
    }
    
    return null;
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values())
      .filter(addr => addr.userId === userId)
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async getAddress(id: string): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async createAddress(userId: string, insertAddress: InsertAddress): Promise<Address> {
    const id = randomUUID();
    const address: Address = {
      ...insertAddress,
      id,
      userId,
      addressLine2: insertAddress.addressLine2 ?? null,
      isDefault: insertAddress.isDefault ?? false,
      createdAt: new Date(),
    };
    
    // If this is set as default, unset other defaults for this user
    if (address.isDefault) {
      const userAddresses = await this.getUserAddresses(userId);
      userAddresses.forEach(addr => {
        if (addr.isDefault) {
          addr.isDefault = false;
          this.addresses.set(addr.id, addr);
        }
      });
    }
    
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(id: string, updates: Partial<InsertAddress>): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address) return undefined;
    
    const updated = { ...address, ...updates };
    
    // If setting as default, unset other defaults for this user
    if (updates.isDefault === true) {
      const userAddresses = await this.getUserAddresses(address.userId);
      userAddresses.forEach(addr => {
        if (addr.id !== id && addr.isDefault) {
          addr.isDefault = false;
          this.addresses.set(addr.id, addr);
        }
      });
    }
    
    this.addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string): Promise<boolean> {
    return this.addresses.delete(id);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const userAddresses = await this.getUserAddresses(userId);
    userAddresses.forEach(addr => {
      addr.isDefault = addr.id === addressId;
      this.addresses.set(addr.id, addr);
    });
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

    const updated = { ...product, ...updates };
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
      addressId: insertOrder.addressId ?? null,
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

    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
