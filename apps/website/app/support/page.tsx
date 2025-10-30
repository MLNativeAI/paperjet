import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Support - PaperJet",
  description: "Get in touch with the PaperJet team for support, questions, or feedback.",
};

export default function SupportPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col relative items-center">
      {/* Extended background grid */}
      <div className="absolute top-0 left-0 right-0 -z-10 h-[100vh] w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about PaperJet? Need help with implementation? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form and we'll get back to you as soon as possible. We typically respond within 24 hours
              during business days.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Email Support</h3>
                <p className="text-muted-foreground">For general questions and technical support</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Documentation</h3>
                <p className="text-muted-foreground">
                  Check our comprehensive documentation for guides and API references.
                </p>
                <a href="https://docs.getpaperjet.com" className="text-primary hover:underline inline-block mt-1">
                  View Documentation →
                </a>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>

        {/* <div className="border-t pt-8"> */}
        {/*   <div className="text-center text-sm text-muted-foreground"> */}
        {/*     <p> */}
        {/*       Looking for our status page or system updates? */}
        {/*       <a */}
        {/*         href="https://status.getpaperjet.com" */}
        {/*         className="text-primary hover:underline ml-1" */}
        {/*         target="_blank" */}
        {/*         rel="noopener noreferrer" */}
        {/*       > */}
        {/*         Check our system status */}
        {/*       </a> */}
        {/*     </p> */}
        {/*   </div> */}
        {/* </div> */}
      </main>
      <Footer />
    </div>
  );
}
