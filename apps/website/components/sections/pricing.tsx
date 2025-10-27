"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cloudPlans = [
  {
    name: "basic",
    price: "$29",
    description: "Perfect for trying things out.",
    features: [
      "100 document conversions",
      "$0.2 per each next document",
      "Max. 20 pages per document",
      "1 user",
      "Export as CSV & JSON",
      "API Access",
      "Community support",
    ],
    cta: "Start 14 day trial",
    href: "https://app.getpaperjet.com",
  },
  {
    name: "Pro",
    description: "For serious document processing",
    price: "$99",
    period: "/month",
    features: [
      "500 document conversions",
      "$0.2 per each next document",
      "Unlimited pages",
      "Unlimited team members",
      "Export as CSV & JSON",
      "API access",
      "Priority support",
    ],
    cta: "Start 14 day trial",
    popular: true,
    href: "https://app.getpaperjet.com",
  },
];

const selfHostedPlans = [
  {
    name: "Personal",
    description: "Perfect for personal projects",
    price: "Free",
    features: ["All features included", "Self-hosted deployment", "Community support"],
    cta: "Get Started",
    href: "https://docs.getpaperjet.com",
  },
  {
    name: "Commercial",
    description: "For commercial use",
    price: "Contact us",
    features: ["All features included", "Self-hosted deployment", "Priority support", "Commercial license"],
    cta: "Contact Sales",
    href: "mailto:contact@getpaperjet.com",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Choose the deployment option that's right for your organization. All plans include the full PaperJet
            platform.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <Tabs defaultValue="cloud" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="rounded-full p-1">
                <TabsTrigger value="cloud" className="rounded-full px-6">
                  Cloud
                </TabsTrigger>
                <TabsTrigger value="self-hosted" className="rounded-full px-6">
                  Self-hosted
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="cloud">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                {cloudPlans.map((plan, i) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                          Most Popular
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          {plan.price !== "Free" && plan.price !== "Custom" && (
                            <span className="text-muted-foreground ml-1">/month</span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-2">{plan.description}</p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-auto rounded-full cursor-pointer ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => window.open(plan.href, "_blank")}
                        >
                          <span className="flex items-center justify-center">{plan.cta}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="self-hosted">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                {selfHostedPlans.map((plan, i) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="relative overflow-hidden h-full border-border/40 shadow-md bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          {plan.price !== "Free" && plan.price !== "Custom" && plan.price !== "Contact us" && (
                            <span className="text-muted-foreground ml-1">/month</span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-2">{plan.description}</p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full mt-auto rounded-full cursor-pointer bg-muted hover:bg-muted/80"
                          variant="outline"
                          onClick={() => {
                            if (plan.href.startsWith("mailto:")) {
                              window.location.href = plan.href;
                            } else {
                              window.open(plan.href, "_blank");
                            }
                          }}
                        >
                          <span className="flex items-center justify-center">{plan.cta}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
