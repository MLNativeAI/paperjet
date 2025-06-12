"use client";

import { motion } from "framer-motion";
import { Badge } from "@docwrench/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@docwrench/ui/accordion";

const faqs = [
  {
    question: "How does DocWrench ensure document privacy?",
    answer:
      "DocWrench processes all documents locally on your infrastructure. No document data ever leaves your environment, ensuring complete privacy and compliance with data protection regulations.",
  },
  {
    question: "What types of documents can DocWrench process?",
    answer:
      "DocWrench can process virtually any document type including PDFs, images, invoices, contracts, construction blueprints, medical records, legal documents, and more. Our AI adapts to different document structures and layouts.",
  },
  {
    question: "Is DocWrench really open source?",
    answer:
      "Yes, DocWrench is fully open source under the MIT license. You have complete access to the source code, can modify it for your needs, and contribute back to the community.",
  },
  {
    question: "How do custom workflows work?",
    answer:
      "Custom workflows allow you to define specific extraction rules, validation steps, and output formats for different document types. You can create workflows through our visual interface or programmatically via our API.",
  },
  {
    question: "What deployment options are available?",
    answer:
      "DocWrench can be deployed on your own infrastructure (on-premise or cloud), in isolated cloud instances, or you can use our managed service with complete data isolation. All options maintain the same privacy-first principles.",
  },
  {
    question: "How accurate is the document extraction?",
    answer:
      "Our AI-powered extraction typically achieves 95%+ accuracy on structured documents like invoices and forms. For complex documents, accuracy varies but improves over time as the system learns from your specific document types and feedback.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge
            className="rounded-full px-4 py-1.5 text-sm font-medium"
            variant="secondary"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Find answers to common questions about our platform.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="border-b border-border/40 py-2"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
