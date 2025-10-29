import { createFileRoute } from "@tanstack/react-router";
import AccountPage from "@/pages/settings/account";

export const Route = createFileRoute("/_app/account")({
  component: RouteComponent,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/settings",
          label: "Settings",
        },
        {
          link: "/settings/account",
          label: "Account",
        },
      ],
    };
  },
});

function RouteComponent() {
  return <AccountPage />;
}
