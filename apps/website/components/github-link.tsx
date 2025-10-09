import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { StarsCount } from "./stars-count";

export function GitHubLink() {
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <Link href="https://github.com/mlnativeai/paperjet" target="_blank" rel="noreferrer">
        <GithubIcon />
        <React.Suspense fallback={<Skeleton className="h-4 w-8" />}>
          <StarsCount />
        </React.Suspense>
      </Link>
    </Button>
  );
}
