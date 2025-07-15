import UsageTable from "@/components/usage-table";
import { useUsageData } from "@/hooks/use-usage-data";

export default function AdminPage() {

  const { usageData, isLoading } = useUsageData()

  return <div>
    <UsageTable usageData={usageData} isLoading={isLoading} />
  </div>
}
