"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 pb-4">
            Privacy-First Document Processing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Open-source platform to securely extract data from any document. Build custom workflows while keeping your
            data private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full h-12 px-8 text-base cursor-pointer" asChild>
              <Link href="https://app.getpaperjet.com" target="_blank" rel="noopener noreferrer">
                Try for free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base cursor-pointer" asChild>
              <Link
                href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3wKFKKFR1VT3FvgEBn1UkkFWNt98CHd7gz5yZ-9Agz_MOrD4Kf6WINDpDtuvHoGkzILg-KpVKo"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Demo
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="size-4 text-primary" />
              <span>Open source</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="size-4 text-primary" />
              <span>Privacy-first</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="size-4 text-primary" />
              <span>Self-hostable</span>
            </div>
          </div>
          <a
            href="http://github.com/mlnativeai/paperjet"
            className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center mt-6 gap-2">
              <Star size={20} />
              <span>Star us on Github</span>
            </div>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto max-w-5xl"
        >
          {/* <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20"> */}
          {/*   <Image */}
          {/*     src="/screenshot.png" */}
          {/*     width={1280} */}
          {/*     height={720} */}
          {/*     alt="PaperJet dashboard" */}
          {/*     className="w-full h-auto" */}
          {/*     priority */}
          {/*   /> */}
          {/*   <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10" /> */}
          {/* </div> */}
          <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70" />
          <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70" />
        </motion.div>
      </div>
    </section>
  );
}
