"use client";

import { motion } from "framer-motion";
import { Factory, IdCard, Receipt, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const templates = [
  {
    icon: Receipt,
    title: "Invoice",
    description: "Extract any data from any invoice, whether it's a PDF, a word document or a noisy photo.",
  },
  {
    icon: Stethoscope,
    title: "Medical",
    description: "Accurate lab results extraction with unit unification and standardization.",
  },
  {
    icon: Factory,
    title: "Industry",
    description: "Extract information from technical drawings and blueprints",
  },
  {
    icon: IdCard,
    title: "ID documents",
    description: "Easily ingest personally identifiable information.",
  },
];

export function PrebuiltTemplates() {
  return (
    <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Prebuilt Templates
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Prebuilt templates</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Start with our customizable templates or build your own workflows
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {templates.map((template, i) => (
            <motion.div
              key={template.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <template.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{template.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
