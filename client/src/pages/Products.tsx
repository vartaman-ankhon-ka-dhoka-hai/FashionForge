import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Products() {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high">("default");
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = useMemo(() => {
    let result = products || [];
    
    if (filter !== "all") {
      result = result.filter((product) => product.category === filter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
    
    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    
    return result;
  }, [products, filter, searchQuery, sortBy]);

  const categories = [
    { value: "all", label: "All Products" },
    { value: "hoodie", label: "Hoodies" },
    { value: "tshirt", label: "T-Shirts" },
  ];

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Shop Collection</h1>
          <p className="text-lg text-muted-foreground">
            Explore our full range of premium streetwear
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-wrap gap-2" data-testid="filter-categories">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={filter === category.value ? "default" : "outline"}
                  onClick={() => setFilter(category.value)}
                  data-testid={`button-filter-${category.value}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
            
            <div className="border-l pl-3 ml-auto flex gap-2">
              <Button
                variant={sortBy === "price-low" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("price-low")}
              >
                Price: Low to High
              </Button>
              <Button
                variant={sortBy === "price-high" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("price-high")}
              >
                Price: High to Low
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16" data-testid="text-no-products">
            <p className="text-lg text-muted-foreground">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
