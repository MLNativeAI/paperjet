import { UsageStatCards } from "@/components/usage-stat-cards";
import UsageTable from "@/components/usage-table";
import { useUsageData } from "@/hooks/use-usage-data";
import { useUsageStats } from "@/hooks/use-usage-stats";

export default function AdminPage() {

  const { usageData, isLoading } = useUsageData()
  const { usageStats } = useUsageStats()

  return <div
    className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
  >
    <UsageStatCards usageStats={usageStats} />
    <UsageTable usageData={usageData} isLoading={isLoading} />
  </div>
}
