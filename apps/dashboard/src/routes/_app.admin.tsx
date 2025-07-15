import AdminPage from '@/pages/admin-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminPage />
}
