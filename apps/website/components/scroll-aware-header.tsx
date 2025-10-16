import Image from "next/image";
import { NavBar } from "./nav-bar";

export const ScrollAwareHeader = () => {
  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 `}>
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-6">
        <a href="https://getpaperjet.com">
          <div className="flex items-center gap-2 font-bold">
            <Image src="/logo.png" alt="PaperJet Logo" width={120} height={40} />
          </div>
        </a>
        <NavBar />
      </div>
    </header>
  );
};
