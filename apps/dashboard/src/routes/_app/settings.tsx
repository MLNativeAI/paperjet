import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full px-4 py-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings, plans and configuration</p>
        </div>
      </div>

      <div>
        <div>
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <Link
                to="/settings"
                activeProps={{
                  className: "border-primary text-primary",
                }}
                viewTransition={{ types: ["cross-fade"] }}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              >
                API Keys
              </Link>
              <Link
                to="/settings/billing"
                activeProps={{
                  className: "border-primary text-primary",
                }}
                viewTransition={{ types: ["cross-fade"] }}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              >
                Billing
              </Link>
              <Link
                to="/settings/organization"
                activeProps={{
                  className: "border-primary text-primary",
                }}
                viewTransition={{ types: ["cross-fade"] }}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              >
                Organization
              </Link>
            </nav>
          </div>

          <div className="pt-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
