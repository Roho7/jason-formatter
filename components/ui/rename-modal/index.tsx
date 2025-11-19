import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export type RenameModalRef = {
  setNewTabName: (name: string) => void;
  open: () => void;
};

export const RenameModal = forwardRef<
  RenameModalRef,
  { onSave: (name: string) => void }
>(({ onSave }, ref) => {
  const [newTabName, setNewTabName] = useState("");
  const [isOpen, setIsOpen] = useState(false);


  useImperativeHandle(ref, () => ({
    setNewTabName: (name: string) => setNewTabName(name),
    open: () => setIsOpen(true),
  }));

  useHotkeys("enter", (event) => {
    event.preventDefault();
    onSave(newTabName);
    setIsOpen(false);
  });


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Tab</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter new tab name"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={() => {
                onSave(newTabName);
                setIsOpen(false);
              }}
             
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
});
