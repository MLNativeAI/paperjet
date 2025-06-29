import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../../styles.css";

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </>
    ),
    notFoundComponent: () => <div>404 Not Found</div>,
});
