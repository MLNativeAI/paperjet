"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@paperjet/ui/accordion";
import { Badge } from "@paperjet/ui/badge";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does PaperJet ensure document privacy?",
    answer:
      "Our solution is fully open source and you can host it on your own infrastructure. This means that no data ever leaves your environment. We also do not depend on any 3rd party tooling on our core infrastructure - everything can be set up with a simple Docker setup. Our cloud service uses models from large AI providers, however we plan on moving to dedicated deployment in the future.",
  },
  {
    question: "What types of documents can PaperJet process?",
    answer:
      "PaperJet can process virtually any document type including PDFs, images, invoices, contracts, construction blueprints, medical records, legal documents, and more. If you have a niche use case you'd like to solve, feel free to reach out to us.",
  },
  {
    question: "Can I use PaperJet for my business?",
    answer:
      "PaperJet is free for personal use under the AGPL v3 license. For business use, you'll need to purchase a commercial license. ",
  },
  {
    question: "What are workflows?",
    answer:
      "Workflows are a way to define specific extraction rules, validation steps, and output formats for different document types. It's a blueprint for how PaperJet should process your documents.",
  },
  {
    question: "What deployment options are available?",
    answer:
      "PaperJet can be deployed on your own infrastructure (on-premise or cloud), in isolated cloud instances, or you can use our managed service with complete data isolation. All options maintain the same privacy-first principles.",
  },
  {
    question: "Can I use my own LLM?",
    answer: "Yes, you can use your own LLM. We support any LLM that supports the OpenAI API format.",
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
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Find answers to common questions about our platform.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AccordionItem value={`item-${i}`} className="border-b border-border/40 py-2">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
