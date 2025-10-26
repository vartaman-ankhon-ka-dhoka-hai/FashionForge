import { Card } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">About URBAN THREAD</h1>
        
        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              URBAN THREAD was born from a simple idea: create premium streetwear that doesn't compromise on quality or design. We believe that fashion should be accessible, sustainable, and timeless.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every piece in our collection is thoughtfully designed with the modern urban lifestyle in mind. We focus on minimalist aesthetics, superior materials, and exceptional craftsmanship.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Quality First</h3>
                <p className="text-muted-foreground text-sm">
                  We use only premium materials and work with skilled artisans to ensure every piece meets our high standards.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Minimalist Design</h3>
                <p className="text-muted-foreground text-sm">
                  Clean lines, timeless silhouettes, and thoughtful details that speak for themselves.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sustainability</h3>
                <p className="text-muted-foreground text-sm">
                  We're committed to reducing our environmental impact through responsible sourcing and production.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-muted-foreground text-sm">
                  Building a community of individuals who value quality, style, and conscious consumption.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
