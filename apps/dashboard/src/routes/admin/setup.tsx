import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/setup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/admin-setup"!</div>
}
