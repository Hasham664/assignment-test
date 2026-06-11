'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useAdminDashboard, useDevDashboard } from '@/lib/hooks';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FolderKanban, CheckSquare, Users, TrendingUp } from 'lucide-react';

function AdminDashboard() {
  const { dashboard, isLoading } = useAdminDashboard();

  if (isLoading) return <LoadingSpinner className="py-12" />;

  const stats = [
    { label: 'Total Projects', value: dashboard?.totalProjects || 0, icon: FolderKanban, color: 'bg-blue-500' },
    { label: 'Total Tasks', value: dashboard?.totalTasks || 0, icon: CheckSquare, color: 'bg-green-500' },
    { label: 'Developers', value: dashboard?.totalDevelopers || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Completed', value: dashboard?.tasksByStatus?.done || 0, icon: TrendingUp, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Tasks by Status</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboard?.tasksByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Recent Tasks</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.recentTasks?.map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.assignedTo?.name}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DevDashboard() {
  const { dashboard, isLoading } = useDevDashboard();

  if (isLoading) return <LoadingSpinner className="py-12" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.totalTasks || 0}</p>
            </div>
          </CardContent>
        </Card>

        {Object.entries(dashboard?.tasksByStatus || {}).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="flex items-center gap-4">
              <StatusBadge status={status} />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">My Tasks</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.tasks?.slice(0, 5).map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.project?.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">My Projects</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.projects?.map((project) => (
                <div key={project._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="font-medium text-gray-900">{project.title}</p>
                  <StatusBadge status={project.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { user } = useAuthContext();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {user?.role === 'admin' ? <AdminDashboard /> : <DevDashboard />}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
