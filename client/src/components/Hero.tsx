import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_lifestyle_hoodie_shot_dd4434e7.png";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Hero Image with Dark Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium streetwear collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
          Premium Streetwear
          <span className="block mt-2 text-primary">Redefined</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
          Discover our collection of minimalist, high-quality clothing designed for the modern urban lifestyle
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary text-primary-foreground px-8 py-6 text-lg"
            asChild
            data-testid="button-shop-now"
          >
            <Link href="/products">
              Shop Now
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg"
            asChild
            data-testid="button-learn-more"
          >
            <Link href="/about">
              Learn More
            </Link>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/60" />
        </div>
      </div>
    </section>
  );
}
