"use client";

import { useEffect, useState } from "react";

export function StarsCount() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/mlnativeai/paperjet")
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(0));
  }, []);

  if (stars === null) {
    return <span className="text-muted-foreground w-8 text-xs tabular-nums">...</span>;
  }

  return (
    <span className="text-muted-foreground w-8 text-xs tabular-nums">
      {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toLocaleString()}
    </span>
  );
}
