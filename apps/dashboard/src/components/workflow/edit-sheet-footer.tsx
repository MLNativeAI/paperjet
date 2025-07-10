import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";

interface EditSheetFooterProps {
  mode: "edit" | "create";
  isSubmitting: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  submitLabel?: {
    create: string;
    edit: string;
  };
  deleteLabel?: string;
}

export default function EditSheetFooter({
  mode,
  isSubmitting,
  onDelete,
  isDeleting,
  submitLabel = {
    create: "Create",
    edit: "Save changes",
  },
  deleteLabel = "Delete",
}: EditSheetFooterProps) {
  return (
    <SheetFooter className="flex-col">
      <div className="flex gap-2 w-full">
        <SheetClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            Cancel
          </Button>
        </SheetClose>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? submitLabel.create
              : submitLabel.edit}
        </Button>
      </div>
      {mode === "edit" && onDelete && (
        <>
          <Separator className="my-4" />
          <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting} className="w-full">
            {isDeleting ? "Deleting..." : deleteLabel}
          </Button>
        </>
      )}
    </SheetFooter>
  );
}
