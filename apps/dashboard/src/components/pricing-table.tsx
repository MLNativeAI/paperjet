import { CircleCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period?: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
}

interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

const Pricing2 = ({ heading = "Pricing", description = "Check out our affordable pricing plans" }: Pricing2Props) => {
  const [isSelfHosted, setIsSelfHosted] = useState(false);

  const cloudPlans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for trying things out",
      price: "$29",
      period: "/month",
      features: [
        { text: "100 document conversions" },
        { text: "Max. 20 pages per document" },
        { text: "Export as CSV & JSON" },
        { text: "API Support" },
      ],
      button: {
        text: "Get Started",
        url: "https://shadcnblocks.com",
      },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For serious document processing",
      price: "$99",
      period: "/month",
      features: [
        { text: "500 document conversions" },
        { text: "Unlimited team members" },
        { text: "Unlimited pages per document" },
        { text: "Export as CSV & JSON" },
        { text: "API Support" },
      ],
      button: {
        text: "Get Started",
        url: "https://shadcnblocks.com",
      },
    },
  ];

  const selfHostedPlans = [
    {
      id: "personal",
      name: "Personal",
      description: "Perfect for personal projects",
      price: "Free",
      features: [{ text: "All features included" }, { text: "Self-hosted deployment" }, { text: "Community support" }],
      button: {
        text: "Get Started",
        url: "https://shadcnblocks.com",
      },
    },
    {
      id: "commercial",
      name: "Commercial",
      description: "For commercial use",
      price: "Contact us",
      features: [
        { text: "All features included" },
        { text: "Self-hosted deployment" },
        { text: "Priority support" },
        { text: "Commercial license" },
      ],
      button: {
        text: "Contact Sales",
        url: "https://shadcnblocks.com",
      },
    },
  ];

  const currentPlans = isSelfHosted ? selfHostedPlans : cloudPlans;
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="text-pretty text-4xl font-semibold lg:text-6xl">{heading}</h2>
          <p className="text-muted-foreground lg:text-xl">{description}</p>
          <div className="flex items-center gap-3 text-lg">
            Cloud
            <Switch checked={isSelfHosted} onCheckedChange={() => setIsSelfHosted(!isSelfHosted)} />
            Self-hosted
          </div>
          <div className="flex flex-col items-stretch gap-6 md:flex-row">
            {currentPlans.map((plan) => (
              <Card key={plan.id} className="flex w-80 flex-col justify-between text-left">
                <CardHeader>
                  <CardTitle>
                    <p>{plan.name}</p>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="flex items-end">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-muted-foreground text-2xl font-semibold">{plan.period ?? ""}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  {plan.id === "pro" && !isSelfHosted && (
                    <p className="mb-3 font-semibold">Everything in Basic, and:</p>
                  )}
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2 text-sm">
                        <CircleCheck className="size-4" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <a href={plan.button.url} target="_blank">
                      {plan.button.text}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing2 };
