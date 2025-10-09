export async function StarsCount() {
  const data = await fetch("https://api.github.com/repos/mlnativeai/paperjet", {
    next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
  });
  const json = await data.json();

  return (
    <span className="text-muted-foreground w-8 text-xs tabular-nums">
      {json.stargazers_count >= 1000
        ? `${(json.stargazers_count / 1000).toFixed(1)}k`
        : json.stargazers_count.toLocaleString()}
    </span>
  );
}
