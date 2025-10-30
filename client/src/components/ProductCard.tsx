import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const [justAdded, setJustAdded] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1000);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 cursor-pointer relative" data-testid={`card-product-${product.id}`}>
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all ${
              inWishlist ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
            onClick={handleWishlistClick}
          >
            <motion.div
              animate={justAdded ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className="h-5 w-5"
                fill={inWishlist ? "currentColor" : "none"}
              />
            </motion.div>
          </Button>

          {/* Product Image */}
          <div className="aspect-square overflow-hidden bg-muted relative">
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Badge variant="secondary" className="text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-tight" data-testid={`text-product-name-${product.id}`}>
                {product.name}
              </h3>
              {product.featured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
                ₹{parseFloat(product.price).toFixed(2)}
              </span>
              {product.inStock && (
                <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                  In Stock
                </Badge>
              )}
            </div>
          </div>
        </Card>
    </Link>
  );
}
