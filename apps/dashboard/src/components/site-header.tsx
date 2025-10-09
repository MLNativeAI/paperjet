import { useRouterState } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const context = useRouterState({
    select: (state) => {
      const lastMatch = state.matches[state.matches.length - 1];
      return lastMatch?.context || {};
    },
  });

  const { breadcrumbs, useFullWidth } = context;
  const root =
    breadcrumbs.length > 0
      ? breadcrumbs[0]
      : {
          label: "Default",
          link: "/",
        };
  const elements = breadcrumbs.slice(1, undefined);
  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12
        border-b"
    >
      <div className={cn("flex w-full items-center gap-1 px-4", !useFullWidth && "max-w-7xl mx-auto")}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={root.link}>{root.label}</BreadcrumbLink>
            </BreadcrumbItem>
            {elements.map((elem) => {
              return (
                <Fragment key={elem.label}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem key={elem.label}>
                    <BreadcrumbLink href={elem.link}>{elem.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
