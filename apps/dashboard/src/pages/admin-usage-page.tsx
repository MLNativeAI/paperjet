import { UsageStatCards } from "@/components/usage-stat-cards";
import UsageTable from "@/components/usage-table";
import { useUsageData } from "@/hooks/use-usage-data";

export default function AdminUsagePage() {
  const { usageData, usageDataLoading } = useUsageData();

  if (usageDataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <UsageStatCards usageStats={usageData.usageStats} />
      <UsageTable usageData={usageData.usageData} isLoading={usageDataLoading} />
    </div>
  );
}
