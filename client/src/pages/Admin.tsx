import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProductSchema, type InsertProduct, type Product, type Order } from "@shared/schema";
import { Plus, Edit, Trash2, Package, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "packed", label: "Packed", color: "bg-purple-500" },
  { value: "shipped", label: "Shipped", color: "bg-yellow-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user && !!isAdmin,
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image: "",
      category: "shirt",
      sizes: ["S", "M", "L", "XL"],
      inStock: true,
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product created successfully" });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertProduct }) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      setEditingProduct(null);
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update order status", description: error.message, variant: "destructive" });
    },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category as any,
      sizes: product.sizes,
      inStock: product.inStock,
      featured: product.featured,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredOrders = orders?.filter((order) => 
    statusFilter === "all" || order.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find((s) => s.value === status);
    return statusInfo || ORDER_STATUSES[0];
  };

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage products and orders</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingProduct(null);
                  form.reset();
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-product">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct 
                        ? "Update the product details below." 
                        : "Fill in the product details to add it to your catalog."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Premium Kurta" {...field} data-testid="input-product-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Product description"
                                className="min-h-[100px]"
                                {...field}
                                data-testid="input-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (₹)</FormLabel>
                              <FormControl>
                                <Input type="text" placeholder="2499.00" {...field} data-testid="input-product-price" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-product-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kurta">Kurta</SelectItem>
                                  <SelectItem value="shirt">Shirt</SelectItem>
                                  <SelectItem value="pant">Pant</SelectItem>
                                  <SelectItem value="dupatta">Dupatta</SelectItem>
                                  <SelectItem value="saree">Saree</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="/images/product.jpg" {...field} data-testid="input-product-image" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name="inStock"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                  data-testid="checkbox-product-instock"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0 cursor-pointer">In Stock</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                  data-testid="checkbox-product-featured"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0 cursor-pointer">Featured</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            setEditingProduct(null);
                            form.reset();
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                          className="flex-1"
                          data-testid="button-submit-product"
                        >
                          {editingProduct ? "Update Product" : "Add Product"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <p className="text-center py-8">Loading products...</p>
            ) : products && products.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      data-testid={`img-product-${product.id}`}
                    />
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">₹{product.price}</span>
                        <Badge variant={product.inStock ? "default" : "destructive"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {product.featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="flex-1"
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="flex-1"
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No products yet. Add your first product!</p>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-order-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {ordersLoading ? (
              <p className="text-center py-8">Loading orders...</p>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg" data-testid={`text-order-id-${order.id}`}>
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge className={`${getStatusBadge(order.status).color} text-white`}>
                            {getStatusBadge(order.status).label}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Shipping Address:</h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-shipping-address-${order.id}`}>
                            {order.shippingAddress}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Items:</h4>
                          <div className="text-sm text-muted-foreground">
                            {JSON.parse(order.items).map((item: any, idx: number) => (
                              <div key={idx}>
                                {item.name} ({item.size}) x {item.quantity}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-lg font-bold">
                          Total: ₹{order.totalAmount}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm mb-2">Update Status:</h4>
                        {ORDER_STATUSES.filter(s => s.value !== "cancelled").map((status) => (
                          <Button
                            key={status.value}
                            variant={order.status === status.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: status.value })}
                            className="w-full justify-start"
                            disabled={updateOrderStatusMutation.isPending}
                            data-testid={`button-status-${status.value}-${order.id}`}
                          >
                            {order.status === status.value && <CheckCircle2 className="h-4 w-4 mr-2" />}
                            {status.label}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: "cancelled" })}
                          className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-white"
                          disabled={updateOrderStatusMutation.isPending || order.status === "cancelled"}
                          data-testid={`button-status-cancelled-${order.id}`}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {statusFilter === "all" ? "No orders yet" : `No ${statusFilter} orders`}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
