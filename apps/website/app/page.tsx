import Blog from "@/components/blog";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  CTA,
  DeploymentOptions,
  FAQ,
  Features,
  Hero,
  HowItWorks,
  PrebuiltTemplates,
  Pricing,
} from "../components/sections";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col relative items-center">
      {/* Extended background grid */}
      <div className="absolute top-0 left-0 right-0 -z-10 h-[100vh] w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <Header />
      <main className="flex-1">
        <Hero />
        {/* <Logos /> */}
        <Features />
        <HowItWorks />
        <DeploymentOptions />
        <PrebuiltTemplates />
        {/* <Testimonials /> */}
        <Pricing />
        <FAQ />
        <Blog />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
