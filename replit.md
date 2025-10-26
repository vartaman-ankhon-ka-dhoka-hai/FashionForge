# URBAN THREAD - Premium Streetwear E-commerce Platform

A complete, modular e-commerce web application for a small clothing brand built with a modern tech stack.

## Project Overview

URBAN THREAD is a full-stack e-commerce platform featuring a premium dark theme with orange accents. The application is optimized for 40-200 daily customers with a focus on performance, responsive design, and user experience.

## Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Wouter (routing)
- TailwindCSS (styling)
- Shadcn UI (component library)
- TanStack Query (data fetching)
- Zustand (cart state management)
- React Hook Form + Zod (form validation)

**Backend:**
- Node.js + Express
- In-memory storage (MemStorage) - easily replaceable with MongoDB/PostgreSQL
- JWT authentication with bcryptjs
- Zod schema validation

**Development:**
- Vite (build tool)
- TypeScript
- ESLint

## Features

### Implemented ✅

1. **Product Management**
   - Full CRUD operations for products
   - Category filtering (hoodies, t-shirts)
   - Featured products
   - Stock management
   - Admin dashboard for product management

2. **User Authentication**
   - User registration and login
   - JWT-based authentication
   - Password hashing with bcryptjs
   - Admin role management
   - Protected routes

3. **Shopping Cart**
   - Add/remove items with size selection
   - Quantity management
   - Persistent cart (localStorage via Zustand)
   - Real-time cart total calculation

4. **Checkout Flow**
   - Shipping address collection
   - Order creation with pending payment status
   - Order history for users
   - Payment integration placeholder

5. **Responsive Design**
   - Mobile-first approach
   - Fully responsive on all screen sizes
   - Mobile navigation menu
   - Optimized layouts for tablets and desktops

6. **UI/UX**
   - Premium dark theme with orange (#f97316) accent color
   - Smooth animations and transitions
   - Loading states and error handling
   - Beautiful empty states
   - Accessible design (WCAG AA compliant)

### Placeholders for Future Integration 🚧

1. **Payment Gateway**
   - Stripe/Razorpay integration ready
   - Payment intent endpoint stubbed
   - See `.env.example` for required API keys
   - TODO comments in `server/routes.ts` and `client/src/pages/Checkout.tsx`

2. **OTP Verification**
   - SMS/Email OTP for user verification
   - Twilio/SendGrid integration ready
   - See `.env.example` for configuration

## Project Structure

```
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui/          # Shadcn components
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Admin.tsx
│   │   │   ├── About.tsx
│   │   │   └── Contact.tsx
│   │   ├── lib/             # Utilities and stores
│   │   │   ├── cart-store.ts
│   │   │   ├── auth-context.tsx
│   │   │   └── queryClient.ts
│   │   └── App.tsx          # Main app component
│   └── index.html
├── server/                   # Backend application
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Storage interface & implementation
│   └── index.ts             # Server entry point
├── shared/                  # Shared code between frontend and backend
│   └── schema.ts            # Data models and validation schemas
├── attached_assets/         # Generated product images
├── .env.example            # Environment variable template
└── design_guidelines.md    # Design system documentation
```

## Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation & Running

1. The application is already configured to run on Replit
2. Click the "Run" button to start the development server
3. The app will be available at the provided Replit URL

### Default Credentials

**Admin Account:**
- Email: `admin@urbanthread.com`
- Password: `admin123`

Use the admin account to access the admin dashboard at `/admin` and manage products.

### Environment Variables

Copy `.env.example` and configure as needed:

```bash
JWT_SECRET=your-secret-key-change-in-production

# Add when ready to enable payments
# STRIPE_SECRET_KEY=sk_test_...
# VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/all` - Get all orders (admin only)
- `POST /api/orders` - Create order (protected)
- `PATCH /api/orders/:id` - Update order status (admin only)

### Payments (Placeholder)
- `POST /api/create-payment-intent` - Create payment intent (TODO)

## Design System

The application follows a premium dark theme with these key colors:
- **Primary (Orange):** `#f97316` (hsl 24 95% 53%)
- **Background:** Very dark gray (#121212)
- **Card:** Slightly lighter gray (#171717)
- **Foreground:** Near white for text

See `design_guidelines.md` for complete design specifications.

## Database Migration

The application currently uses in-memory storage. To migrate to MongoDB or PostgreSQL:

1. Install database driver:
   ```bash
   npm install mongoose  # For MongoDB
   # or
   npm install pg drizzle-orm  # For PostgreSQL
   ```

2. Implement database-backed storage in `server/storage.ts`:
   - Extend or replace `MemStorage` class
   - Implement all methods in `IStorage` interface
   - Update connection in `server/index.ts`

3. The schema is already defined in `shared/schema.ts` using Drizzle ORM

## Deployment

### Replit Deployment
1. This project is already configured for Replit
2. Use the "Deploy" button to publish
3. Set environment variables in Replit Secrets

### Alternative Platforms
- **Vercel:** Deploy frontend, use serverless functions for API
- **Render:** Deploy full-stack app with web service
- **Railway:** Deploy with auto-detected build configuration

## Performance Optimizations

- Lazy loading for product images
- React Query caching for API responses
- Optimistic UI updates for cart operations
- Minimized bundle size with code splitting
- Persistent cart state across sessions

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT tokens with 7-day expiration
- Protected API routes with authentication middleware
- Input validation with Zod schemas
- XSS protection via React's built-in escaping
- CSRF protection ready for production

## Testing

Comprehensive test coverage includes:
- User authentication flow
- Product browsing and filtering
- Cart management
- Checkout process
- Admin product CRUD operations

## Future Enhancements

1. **Payment Integration:** Complete Stripe/Razorpay setup
2. **Email Notifications:** Order confirmations and shipping updates
3. **Product Reviews:** User ratings and reviews
4. **Wishlist:** Save favorite products
5. **Advanced Filtering:** Price range, size availability, sorting
6. **Search:** Full-text product search
7. **Inventory Management:** Low stock alerts, auto-restock
8. **Analytics:** Sales dashboard and customer insights

## Support

For issues or questions:
- Check the code comments for TODOs
- Review `.env.example` for configuration
- See `design_guidelines.md` for UI/UX standards

## License

This project is built for educational and commercial purposes.
