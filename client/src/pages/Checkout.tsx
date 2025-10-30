import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/lib/cart-store";
import { apiRequest } from "@/lib/queryClient";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { CreditCard, Truck } from "lucide-react";

const checkoutSchema = insertOrderSchema.extend({
  shippingAddress: z.string().min(10, "Please enter a complete address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
      items: "",
      totalAmount: "",
      userId: user?.id || "",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // TODO: Integrate Stripe or Razorpay payment gateway here
      // For now, we'll simulate payment processing
      setPaymentProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const orderData = {
        ...data,
        userId: user?.id || "",
        items: JSON.stringify(items),
        totalAmount: getTotalPrice().toFixed(2),
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: (data) => {
      setPaymentProcessing(false);
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Order #${data.id.slice(0, 8)} - Thank you for your purchase`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      setPaymentProcessing(false);
      toast({
        title: "Order failed",
        description: error.message || "Could not process order",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Please login to checkout</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to complete your purchase
          </p>
          <Button onClick={() => setLocation("/login")} data-testid="button-login">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => setLocation("/products")} data-testid="button-shop">
            Start Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Shipping Information</h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => orderMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your complete shipping address"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-shipping-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Card className="p-6 bg-muted/50">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Payment Method</h3>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <strong>Note:</strong> Payment integration (Stripe/Razorpay) will be available soon.
                      </p>
                      <p>
                        For now, clicking "Place Order" will create a test order with pending payment status.
                      </p>
                    </div>
                  </Card>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={orderMutation.isPending || paymentProcessing}
                    data-testid="button-place-order"
                  >
                    {paymentProcessing
                      ? "Processing Payment..."
                      : orderMutation.isPending
                      ? "Placing Order..."
                      : "Place Order"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} ({item.size}) x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-primary">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-primary" data-testid="text-order-total">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
