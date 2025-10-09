import { useEffect } from "react";
import { toast } from "sonner";
import { Route } from "@/routes/_app";

export function useQueryNotifications() {
  const { signedIn, newUser } = Route.useSearch();
  useEffect(() => {
    if (signedIn === true) {
      toast.success("Welcome back!");
    }
  }, [signedIn]);
  useEffect(() => {
    if (newUser === true) {
      toast.success("Hi new user");
    }
  }, [newUser]);
}
