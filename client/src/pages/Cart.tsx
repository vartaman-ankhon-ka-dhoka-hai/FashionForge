import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold mb-2" data-testid="text-empty-cart">Your cart is empty</h2>
            <p className="text-muted-foreground">Add some items to get started</p>
          </div>
          <Link href="/products">
            <a>
              <Button size="lg" data-testid="button-shop-now">
                Shop Now
              </Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.productId}-${item.size}`} className="p-4 sm:p-6" data-testid={`cart-item-${item.productId}-${item.size}`}>
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md bg-muted"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg" data-testid={`text-cart-item-name-${item.productId}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          data-testid={`button-decrease-${item.productId}-${item.size}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold" data-testid={`text-quantity-${item.productId}-${item.size}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          data-testid={`button-increase-${item.productId}-${item.size}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId, item.size)}
                        data-testid={`button-remove-${item.productId}-${item.size}`}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium" data-testid="text-subtotal">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl text-primary" data-testid="text-total">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
              <Link href="/checkout">
                <a>
                  <Button size="lg" className="w-full" data-testid="button-checkout">
                    Proceed to Checkout
                  </Button>
                </a>
              </Link>
              <Link href="/products">
                <a>
                  <Button variant="outline" className="w-full mt-3" data-testid="button-continue-shopping">
                    Continue Shopping
                  </Button>
                </a>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
