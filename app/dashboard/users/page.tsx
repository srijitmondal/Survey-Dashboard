import UserManagement from "@/components/admin/user-management"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <UserManagement />
    </DashboardLayout>
  )
}
