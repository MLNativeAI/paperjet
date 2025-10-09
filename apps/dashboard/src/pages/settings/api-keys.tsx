import { ApiKeysList } from "@/components/api-keys-list";
import { useApiKeys } from "@/hooks/use-api-keys";

export default function ApiKeysPage() {
  const { apiKeys, isLoading, refetch } = useApiKeys();

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div>Loading settings...</div>
      </div>
    );
  }

  return <ApiKeysList apiKeys={apiKeys} onRefresh={refetch} />;
}
