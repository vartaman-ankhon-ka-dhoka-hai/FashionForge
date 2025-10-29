import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import logoImage from "@assets/generated_images/Clothing_brand_logo_icon_02f84793.png";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 cursor-pointer" data-testid="link-home">
              <img src={logoImage} alt="URBAN THREAD" className="h-8 w-8" />
              <span className="text-lg font-bold tracking-tight">URBAN THREAD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href ? "text-primary" : "text-foreground"
                  }`}
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" asChild data-testid="button-wishlist">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild data-testid="button-cart">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
                    data-testid="text-cart-count"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex" asChild data-testid="link-login">
              <Link href="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-2 text-lg font-medium rounded-md hover-elevate active-elevate-2 cursor-pointer ${
                          location === link.href ? "text-primary" : "text-foreground"
                        }`}
                        data-testid={`mobile-link-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </div>
                    </Link>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    asChild 
                    data-testid="mobile-link-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">
                      <User className="h-4 w-4 mr-2" />
                      Login / Register
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
