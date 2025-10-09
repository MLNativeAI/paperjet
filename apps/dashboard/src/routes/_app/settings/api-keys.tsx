import { createFileRoute } from "@tanstack/react-router";
import ApiKeysPage from "@/pages/settings/api-keys";

export const Route = createFileRoute("/_app/settings/api-keys")({
  component: RouteComponent,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/settings",
          label: "Settings",
        },
        {
          link: "/settings/api-keys",
          label: "API Keys",
        },
      ],
    };
  },
});

function RouteComponent() {
  return <ApiKeysPage />;
}
