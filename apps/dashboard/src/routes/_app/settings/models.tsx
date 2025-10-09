import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/models")({
  component: RouteComponent,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/settings",
          label: "Settings",
        },
        {
          link: "/settings/models",
          label: "Models",
        },
      ],
    };
  },
});

function RouteComponent() {
  return <div>Hello "/_app/settings/models"!</div>;
}
