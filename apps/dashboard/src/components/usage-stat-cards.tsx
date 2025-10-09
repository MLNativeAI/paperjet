import type { UsageStats } from "@paperjet/engine/types";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { renderMonetaryValue } from "./format-utils";

export function UsageStatCards({ usageStats }: { usageStats: UsageStats }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Cost</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {usageStats.cost && renderMonetaryValue(usageStats.cost)}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline"> */}
            {/*   <IconTrendingUp /> */}
            {/*   +12.5% */}
            {/* </Badge> */}
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm"> */}
        {/*   <div className="line-clamp-1 flex gap-2 font-medium"> */}
        {/*     Trending up this month <IconTrendingUp className="size-4" /> */}
        {/*   </div> */}
        {/*   <div className="text-muted-foreground"> */}
        {/*     Visitors for the last 6 months */}
        {/*   </div> */}
        {/* </CardFooter> */}
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {usageStats.users}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline"> */}
            {/*   <IconTrendingDown /> */}
            {/*   -20% */}
            {/* </Badge> */}
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm"> */}
        {/*   <div className="line-clamp-1 flex gap-2 font-medium"> */}
        {/*     Down 20% this period <IconTrendingDown className="size-4" /> */}
        {/*   </div> */}
        {/*   <div className="text-muted-foreground"> */}
        {/*     Acquisition needs attention */}
        {/*   </div> */}
        {/* </CardFooter> */}
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {usageStats.requests}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline"> */}
            {/*   <IconTrendingUp /> */}
            {/*   +12.5% */}
            {/* </Badge> */}
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm"> */}
        {/*   <div className="line-clamp-1 flex gap-2 font-medium"> */}
        {/*     Strong user retention <IconTrendingUp className="size-4" /> */}
        {/*   </div> */}
        {/*   <div className="text-muted-foreground">Engagement exceed targets</div> */}
        {/* </CardFooter> */}
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Workflow runs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {usageStats.executions}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline"> */}
            {/*   <IconTrendingUp /> */}
            {/*   +4.5% */}
            {/* </Badge> */}
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm"> */}
        {/*   <div className="line-clamp-1 flex gap-2 font-medium"> */}
        {/*     Steady performance increase <IconTrendingUp className="size-4" /> */}
        {/*   </div> */}
        {/*   <div className="text-muted-foreground">Meets growth projections</div> */}
        {/* </CardFooter> */}
      </Card>
    </div>
  );
}
