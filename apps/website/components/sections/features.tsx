"use client";

import { Badge } from "@paperjet/ui/badge";
import { Card, CardContent } from "@paperjet/ui/card";
import { motion } from "framer-motion";
import { BarChart, Layers, Shield, Star, Users, Zap } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    title: "Privacy-First Processing",
    description: "Keep your sensitive documents secure with local processing and no data leaving your infrastructure.",
    icon: <Shield className="size-5" />,
  },
  {
    title: "Custom Workflows",
    description: "Build tailored document processing workflows that match your specific business requirements.",
    icon: <Layers className="size-5" />,
  },
  {
    title: "Universal Document Support",
    description:
      "Process any document type - from simple invoices to complex construction blueprints and legal contracts.",
    icon: <Star className="size-5" />,
  },
  {
    title: "Fully customizable",
    description:
      "Bring your own AI models - whether you're running in a datacenter or on a Raspberry PI, we have you covered.",
    icon: <Zap className="size-5" />,
  },
  {
    title: "Advanced Extraction",
    description:
      "Leverage AI-powered extraction to pull structured data from unstructured documents with high accuracy.",
    icon: <BarChart className="size-5" />,
  },
  {
    title: "Enterprise Ready",
    description: "Self-hosted deployment options with enterprise-grade security and compliance features.",
    icon: <Users className="size-5" />,
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need for Document Processing</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Our comprehensive platform provides all the tools you need to extract, process, and analyze documents while
            maintaining complete privacy and control.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
