import { cn } from "@/lib/utils";
import Eyebrow from "./eyebrow";
import { HeroSectionData } from "@/constants/hero-section";

export default function HeroSection() {
  return (
    <>
      <section className={cn("grid grid-cols-12 grid-rows-12 w-lvw h-lvh ")}>
        <h1 id="hero-section-heading" className="sr-only">
          Query Fit Hero Section
        </h1>
        <div
          className={cn(
            "lg:col-span-8 lg:col-start-3 lg:row-span-8 lg:row-start-3 lg:grid lg:grid-cols-8 lg:grid-rows-8 bg-background"
          )}
        >
          <Eyebrow className="col-span-full row-span-1 font-dosis " text={HeroSectionData.eyebrowText}/>

            
        </div>
      </section>
    </>
  );
}
