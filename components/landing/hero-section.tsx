import { cn } from "@/lib/utils";

export default function HeroSection() {
  return (
    <>
      <section className={cn("grid grid-cols-12 grid-rows-12 w-lvw h-lvh")}>
        <h1 id="hero-section-heading" className="sr-only">
          Query Fit Hero Section
        </h1>
        <div
          className={cn(
            "lg:col-span-8 lg:col-start-3 lg:row-span-8 lg:row-start-3 bg-background"
          )}
        >

            
        </div>
      </section>
    </>
  );
}
