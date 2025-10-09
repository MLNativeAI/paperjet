import type { UsageData } from "@paperjet/engine/types";
import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function UserFilterComboBox({
  usageData,
  updateFilter,
}: {
  usageData: UsageData[];
  updateFilter: (email: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const allUserEmails = [...new Set(usageData.map((ud) => ud.userEmail))].filter((email) => email !== null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-expanded={open} className="w-[250px] justify-between">
          {value ? allUserEmails.find((email) => email === value) : "Select user..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {allUserEmails
                .filter((email) => email !== null)
                .map((validEmail) => (
                  <CommandItem
                    key={validEmail}
                    value={validEmail} // TODO: Figure out if this is TS server null issue or not
                    onSelect={(currentValue) => {
                      if (currentValue === validEmail) {
                        setValue(currentValue);
                        updateFilter(currentValue);
                      } else {
                        setValue("");
                      }
                      setOpen(false);
                    }}
                  >
                    {validEmail}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
