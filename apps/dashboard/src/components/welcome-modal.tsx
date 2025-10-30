"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  user: any; // Using any for now due to type sync issues
}

export function WelcomeModal({ isOpen, onClose, onStartTour, user }: WelcomeModalProps) {
  const isAdmin = user?.role === "superadmin" || user?.role === "admin";
  const tourType = isAdmin ? "Admin Tour" : "User Tour";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to PaperJet! 🎉</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "You're all set up as an admin! Let's walk you through your workspace and show you how to manage your team and workflows."
              : "You're all set up! Let's walk you through your workspace and show you how to create and manage your workflows."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Quick introduction to the interface</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Learn about key features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Tips to get you started quickly</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={onStartTour}>Start {tourType}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
