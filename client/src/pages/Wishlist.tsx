import { useWishlistStore } from "@/lib/wishlist-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { motion } from "framer-motion";

export default function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: "M",
      quantity: 1,
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Start adding items you love to your wishlist!
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={clearWishlist}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden group">
              <Link href={`/products/${item.productId}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-3">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-semibold hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-lg font-bold text-primary">
                  ${item.price.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
