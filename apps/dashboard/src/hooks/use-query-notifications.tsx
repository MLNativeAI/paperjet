import { useEffect } from "react";
import { toast } from "sonner";
import { Route } from "@/routes/_app";
import { useAuthenticatedUser } from "./use-user";

export function useQueryNotifications() {
  const { user } = useAuthenticatedUser();
  const { signedIn, newUser } = Route.useSearch();
  useEffect(() => {
    if (signedIn === true && user) {
      toast.success(`Welcome back, ${user.name}!`);
    }
  }, [signedIn]);
  useEffect(() => {
    if (newUser === true && user) {
      toast.success(`Hi, ${user.name}`);
    }
  }, [newUser]);
}
