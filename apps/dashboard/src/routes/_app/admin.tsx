import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user?.role !== "superadmin") {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="w-full px-4 py-8 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Configure and monitor this PaperJet instance</p>
        </div>
      </div>

      <div>
        <div>
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <Link
                to="/admin/models"
                activeProps={{
                  className: "border-primary text-primary",
                }}
                viewTransition={{ types: ["cross-fade"] }}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              >
                Models
              </Link>
              <Link
                to="/admin/usage-data"
                activeProps={{
                  className: "border-primary text-primary",
                }}
                viewTransition={{ types: ["cross-fade"] }}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              >
                Usage Data
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
