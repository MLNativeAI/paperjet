import { isAdminSetupRequired } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import AdminSetupPage from '@/pages/admin-setup-page'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/setup')({
  beforeLoad: async () => {
    const { isSetupRequired } = await isAdminSetupRequired()

    if (!isSetupRequired) {
      throw redirect({
        to: "/"
      })
    }

    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: AdminSetupPage
})
