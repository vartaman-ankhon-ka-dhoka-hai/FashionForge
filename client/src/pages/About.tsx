import { Card } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Made in Pune</h1>
        
        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Made in Pune celebrates the rich cultural heritage and craftsmanship of Pune. We believe in creating authentic Indian apparel that honors our roots while embracing modern design sensibilities.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every piece in our collection showcases local artistry and traditional techniques, blended with contemporary style. We're proud to support local artisans and preserve our cultural legacy.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Cultural Pride</h3>
                <p className="text-muted-foreground text-sm">
                  Celebrating Indian heritage through authentic designs that honor our traditions and local craftsmanship.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Local Artisans</h3>
                <p className="text-muted-foreground text-sm">
                  Supporting skilled craftspeople from Pune and surrounding regions to preserve traditional techniques.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Quality Craftsmanship</h3>
                <p className="text-muted-foreground text-sm">
                  Every piece is made with attention to detail using premium materials and time-honored methods.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Community First</h3>
                <p className="text-muted-foreground text-sm">
                  Building a community that takes pride in Indian culture and supports local businesses.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
