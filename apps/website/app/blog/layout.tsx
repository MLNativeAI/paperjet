import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
