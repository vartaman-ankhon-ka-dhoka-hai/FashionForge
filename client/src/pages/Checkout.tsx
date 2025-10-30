import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/lib/cart-store";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertOrderSchema, insertAddressSchema, type Address } from "@shared/schema";
import { z } from "zod";
import { CreditCard, Truck, Plus, MapPin, Trash2, Check } from "lucide-react";

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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressDialog, setShowNewAddressDialog] = useState(false);

  // Fetch user's saved addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  const addressForm = useForm<z.infer<typeof insertAddressSchema>>({
    resolver: zodResolver(insertAddressSchema),
    defaultValues: {
      label: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    },
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
      items: "",
      totalAmount: "",
      userId: user?.id || "",
    },
  });

  // Add new address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAddressSchema>) => {
      const res = await apiRequest("POST", "/api/addresses", data);
      return res.json();
    },
    onSuccess: (data: Address) => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setSelectedAddressId(data.id);
      setShowNewAddressDialog(false);
      addressForm.reset();
      toast({ title: "Address added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add address",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      if (selectedAddressId && addresses.find((a) => a.id === selectedAddressId)) {
        setSelectedAddressId(null);
      }
      toast({ title: "Address deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete address",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      setPaymentProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const orderData = {
        ...data,
        userId: user?.id || "",
        items: JSON.stringify(items),
        totalAmount: getTotalPrice().toFixed(2),
        addressId: selectedAddressId,
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

  function formatAddress(addr: Address): string {
    return `${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
  }

  // Automatically select the default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Update form when address is selected
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      if (selectedAddr) {
        const formattedAddr = formatAddress(selectedAddr);
        if (form.getValues("shippingAddress") !== formattedAddr) {
          form.setValue("shippingAddress", formattedAddr);
        }
      }
    }
  }, [selectedAddressId, addresses, form]);

  if (!user) {
    setLocation("/login");
    return null;
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
            {/* Address Selection */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Delivery Address</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewAddressDialog(true)}
                  data-testid="button-add-address"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>

              {addressesLoading ? (
                <p className="text-muted-foreground">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No saved addresses</p>
                  <Button onClick={() => setShowNewAddressDialog(true)} data-testid="button-first-address">
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                          selectedAddressId === addr.id ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} data-testid={`radio-address-${addr.id}`} />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={addr.id} className="cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid={`text-address-${addr.id}`}>
                              {formatAddress(addr)}
                            </p>
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddressMutation.mutate(addr.id);
                          }}
                          data-testid={`button-delete-address-${addr.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </Card>

            {/* Payment and Order Placement */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Payment & Order</h2>
              </div>

              <div className="text-sm text-muted-foreground space-y-2 mb-6 p-4 bg-muted/50 rounded-lg">
                <p>
                  <strong>Note:</strong> Payment integration (Razorpay/Stripe) will be available soon.
                </p>
                <p>For now, orders will be created with pending payment status.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => orderMutation.mutate(data))}>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!selectedAddressId || orderMutation.isPending || paymentProcessing}
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
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} ({item.size}) x {item.quantity}
                    </span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-total-amount">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={showNewAddressDialog} onOpenChange={setShowNewAddressDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Enter your delivery address details</DialogDescription>
          </DialogHeader>

          <Form {...addressForm}>
            <form
              onSubmit={addressForm.handleSubmit((data) => addAddressMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={addressForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Work, etc." {...field} data-testid="input-address-label" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="House No., Street" {...field} data-testid="input-address-line1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Landmark, Area" {...field} value={field.value || ""} data-testid="input-address-line2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Pune" {...field} data-testid="input-address-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Maharashtra" {...field} data-testid="input-address-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addressForm.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="411001" maxLength={6} {...field} data-testid="input-address-pincode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                        data-testid="checkbox-address-default"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">Set as default address</FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewAddressDialog(false)}
                  className="flex-1"
                  data-testid="button-cancel-address"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addAddressMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-address"
                >
                  {addAddressMutation.isPending ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
