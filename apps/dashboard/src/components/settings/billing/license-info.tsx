import PlanBadge from "./plan-badge";

export default function LicenseInfo() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Active license</h1>
        <p className="text-muted-foreground">Reach out to us at contact@getpaperjet.com for a commercial license.</p>
      </div>
      <PlanBadge planName={"Personal"} />
    </div>
  );
}
