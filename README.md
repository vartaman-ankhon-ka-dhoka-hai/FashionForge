# URBAN THREAD - Premium Streetwear E-Commerce Platform

A production-ready, psychologically engaging e-commerce platform built with modern technologies and best practices. Features advanced security, responsive design, wishlist functionality, search/filtering, and a captivating user experience designed to maximize engagement and conversions.

## Features

### Core E-Commerce Functionality
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing (12 rounds)
- **Product Management**: Full CRUD operations with category filtering, search, and sorting
- **Shopping Cart**: Persistent cart with real-time updates and optimistic UI
- **Wishlist**: Save favorite products with animated interactions
- **Checkout Flow**: Streamlined checkout with address validation
- **Order Management**: Order history and tracking for users and admins
- **Admin Dashboard**: Product and order management for administrators

### Security Features
- **Rate Limiting**: Protection against brute-force attacks (5 attempts per 15 minutes for auth, 100 for API)
- **CORS Protection**: Configurable allowed origins for production
- **Helmet.js**: Security headers for XSS and clickjacking protection
- **Input Sanitization**: Express-validator for XSS and injection prevention
- **Secure Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Authentication**: 7-day token expiration with secure secret management
- **Environment Variables**: dotenv for secure configuration management

### User Experience
- **Search & Filtering**: Real-time product search with category and price filters
- **Responsive Design**: Mobile-first, optimized for all screen sizes
- **Micro-interactions**: Smooth animations and hover effects
- **Loading States**: Skeleton screens and loading indicators
- **Empty States**: Helpful messages and call-to-actions
- **Trust Signals**: Stock indicators, featured badges, security messaging

### Performance
- **Code Splitting**: Lazy loading for optimal bundle size
- **Image Optimization**: Lazy loading with proper sizing
- **React Query**: Intelligent caching and background updates
- **Persistent State**: Zustand with localStorage for cart and wishlist

## Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Shadcn UI** - Accessible component library
- **Framer Motion** - Smooth animations
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation

### Backend
- **Node.js + Express** - Web server
- **TypeScript** - Type safety
- **JWT + Bcrypt** - Authentication
- **Express-validator** - Input sanitization
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Express-rate-limit** - Rate limiting
- **Drizzle ORM** - Database schema (ready for PostgreSQL/MongoDB)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **dotenv** - Environment variables

## Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Local Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd urban-thread
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # Required in production
   JWT_SECRET=your-secure-random-secret-key-here
   NODE_ENV=development
   PORT=5000
   
   # Optional: Payment integration
   # STRIPE_SECRET_KEY=sk_test_...
   # VITE_STRIPE_PUBLIC_KEY=pk_test_...
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5000`

### Default Credentials

**Admin Account:**
- Email: `admin@urbanthread.com`
- Password: `admin123`

Use the admin account to access the admin dashboard at `/admin` and manage products.

## Project Structure

```
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Shadcn components
│   │   │   ├── Navbar.tsx    # Navigation with cart/wishlist
│   │   │   ├── ProductCard.tsx # Product display with wishlist
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx      # Landing page
│   │   │   ├── Products.tsx  # Product listing with search
│   │   │   ├── Wishlist.tsx  # Saved items
│   │   │   └── ...
│   │   ├── lib/              # Utilities and stores
│   │   │   ├── cart-store.ts
│   │   │   ├── wishlist-store.ts
│   │   │   └── ...
│   │   └── App.tsx           # Main app component
│   └── index.html
├── server/                    # Backend application
│   ├── index.ts              # Server setup with security middleware
│   ├── routes.ts             # API routes with validation
│   ├── storage.ts            # Data storage interface
│   └── vite.ts               # Vite middleware
├── shared/                   # Shared code
│   └── schema.ts             # Data models and validation
├── .env.example             # Environment template
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
└── package.json
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

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 5000) | No |
| `JWT_SECRET` | Secret for JWT signing | Yes (production) |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | No |
| `STRIPE_SECRET_KEY` | Stripe API secret key | No |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | No |

## Deployment

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### Platform-Specific Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Render
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables in dashboard

#### Railway
1. Connect your GitHub repository
2. Railway auto-detects configuration
3. Add environment variables in dashboard

### Environment Configuration for Production

Ensure these environment variables are set in your hosting platform:
- `NODE_ENV=production`
- `JWT_SECRET` (generate a secure random string)
- `ALLOWED_ORIGINS` (your production domain)
- Payment API keys (if using Stripe)

## Security Best Practices

1. **Always use HTTPS in production** - Never send authentication tokens over HTTP
2. **Set strong JWT_SECRET** - Use a cryptographically secure random string (32+ characters)
3. **Configure ALLOWED_ORIGINS** - Restrict CORS to your actual domains
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Never commit secrets** - Use environment variables for all sensitive data
6. **Use secure password policies** - Current minimum is 6 characters, consider increasing for production

## Future Enhancements

### Payment Integration
The app is ready for payment integration. To add Stripe:

1. Install Stripe dependencies (already included)
2. Add Stripe API keys to `.env`
3. Uncomment Stripe code in `server/routes.ts` (line 258-269)
4. Implement frontend payment form in `client/src/pages/Checkout.tsx`

### Database Migration
Currently uses in-memory storage. To migrate to PostgreSQL/MongoDB:

1. Install database driver
2. Implement storage interface in `server/storage.ts`
3. Update connection in `server/index.ts`
4. Run migrations using Drizzle Kit

### Additional Features
- Product reviews and ratings
- Advanced search with filters
- Email notifications
- Wishlist sharing
- Inventory management
- Analytics dashboard

## Performance Optimization

- Bundle size optimized with code splitting
- Images lazy-loaded with proper sizing
- React Query caching reduces API calls
- Persistent state across sessions
- Server-side rate limiting prevents abuse

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint` (if configured)
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Review code comments for implementation details
- Check `.env.example` for configuration options
- See `CHANGELOG.md` for recent updates
- Review `design_guidelines.md` for UI/UX standards

---

Built with ❤️ for the modern web.
