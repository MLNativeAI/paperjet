import type { UsageData } from "@paperjet/engine/types";
import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function WorkflowFilterComboBox({
  usageData,
  updateFilter,
}: {
  usageData: UsageData[];
  updateFilter: (workflowId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const allWorkflows = [...new Set(usageData.map((ud) => ud.workflowId))].filter((workflowId) => workflowId !== null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-expanded={open} className="w-[250px] justify-between">
          {value ? allWorkflows.find((workflowId) => workflowId === value) : "Select workflow..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search workflow..." />
          <CommandList>
            <CommandEmpty>No workflows found.</CommandEmpty>
            <CommandGroup>
              {allWorkflows.map((workflow) => (
                <CommandItem
                  key={workflow}
                  value={workflow} // TODO: Figure out if this is TS server null issue or not
                  onSelect={(currentValue) => {
                    if (currentValue === workflow) {
                      setValue(currentValue);
                      updateFilter(currentValue);
                    } else {
                      setValue("");
                    }
                    setOpen(false);
                  }}
                >
                  {workflow}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
