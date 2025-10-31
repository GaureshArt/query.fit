import { cn } from "@/lib/utils";
import Eyebrow from "./eyebrow";
import { HeroSectionData } from "@/constants/hero-section";
import HeroHeading from "./hero-heading";
import HeroSubheading from "./hero-subheading";
import CtaButton from "./cta-button";
import BorderPlusUi from "../shared/border-plus-ui";
import PlusSvg from "../shared/plus-svg";
import { createClient } from "@/utils/supabase/server";
import { Button } from "../ui/button";
import GoogleIconSvg from "@/public/landing/google-icon";
import { signInWithGoogle } from "@/utils/supabase/actions";

import WelcomeButton from "./welcome-button";

export default async function HeroSection() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  
  return (
    <>
      <section className={cn("grid grid-cols-12 grid-rows-12 w-lvw h-lvh  ")}>
        <h1 id="hero-section-heading" className="sr-only">
          Query Fit Hero Section
        </h1>

        <div
          className={cn(
            "relative lg:col-span-8 lg:col-start-3 lg:row-span-8 lg:row-start-3 lg:grid lg:grid-cols-8 lg:grid-rows-8 bg-background border border-zinc-500/20 "
          )}
        >
          <PlusSvg />
          <Eyebrow
            className="col-span-full row-span-1 font-dosis "
            text={HeroSectionData.eyebrowText}
          />
          <HeroHeading
            className="col-span-4 row-span-4 col-start-3 row-start-2 font-dosis"
            text={HeroSectionData.heroHeading}
          />
          <HeroSubheading
            className="col-span-6 col-start-2 row-span-1 row-start-6 font-cutive-mono "
            text={HeroSectionData.subheading}
          />
          {user.data.user?.id ? (
            <div className={cn("col-span-2 flex justify-center col-start-4")}>
              <WelcomeButton
               text={`Welcome ${user.data.user.user_metadata.name.split(" ")[0]}`}
               iconSvg={null}
               
                className={cn(" row-span-1 row-start-7  font-cutive-mono cursor-pointer")}
              />
            
            
            </div>
          ) : (
            <CtaButton
              className="col-span-full row-span-1 row-start-7 font-cutive-mono"
              text={HeroSectionData.ctaPrimary}
              clickFunc={signInWithGoogle}
              iconSvg={ <GoogleIconSvg />}
            />
          )}
        </div>
      </section>
    </>
  );
}
