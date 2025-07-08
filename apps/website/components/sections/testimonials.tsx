"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "PaperJet has revolutionized how we process construction documents. The privacy-first approach means we can handle sensitive blueprints without worrying about data breaches.",
    author: "Sarah Chen",
    role: "IT Director, BuildCorp",
    rating: 5,
  },
  {
    quote:
      "Being open-source was crucial for our compliance requirements. We can audit the code and ensure our financial documents are processed exactly how we need them.",
    author: "Michael Torres",
    role: "Compliance Officer, FinanceFirst",
    rating: 5,
  },
  {
    quote:
      "The custom workflows feature is incredible. We process everything from invoices to legal contracts, and PaperJet handles them all with amazing accuracy.",
    author: "Emily Rodriguez",
    role: "Operations Manager, LegalTech Inc",
    rating: 5,
  },
  {
    quote:
      "Self-hosting PaperJet gives us complete control over our document processing pipeline. No more sending sensitive data to third-party services.",
    author: "David Kim",
    role: "CTO, SecureData Systems",
    rating: 5,
  },
  {
    quote:
      "The extraction accuracy on our complex engineering documents is outstanding. PaperJet understands document structure better than any solution we've tried.",
    author: "Lisa Patel",
    role: "Document Manager, EngineerPro",
    rating: 5,
  },
  {
    quote:
      "Implementation was straightforward, and the ROI was immediate. We've automated 90% of our invoice processing while keeping everything in-house.",
    author: "James Wilson",
    role: "Finance Director, ManufactureCorp",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by Privacy-Conscious Organizations</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            See how organizations are using PaperJet to process sensitive documents while maintaining complete control
            over their data.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, j) => (
                        <Star
                          key={`star-${testimonial.author}-${j}`}
                          className="size-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                  </div>
                  <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
