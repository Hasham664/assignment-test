'use client';

import { useState } from 'react';
import { useTasks, useProjects, useDevelopers } from '@/lib/hooks';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const KanbanBoard = ({ tasks, onStatusChange }) => {
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ];

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onStatusChange(taskId, status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="bg-gray-50 rounded-xl p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <h3 className="font-semibold text-gray-700 mb-4">{column.label}</h3>
          <div className="space-y-3">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{task.project?.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-xs text-gray-500">{task.assignedTo?.name}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const TaskList = ({ tasks, user, onStatusChange }) => {
  const [editingTask, setEditingTask] = useState(null);

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task._id}>
          <CardContent className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.project?.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' ? (
                <Select
                  value={task.status}
                  onChange={(e) => onStatusChange(task._id, e.target.value)}
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'review', label: 'Review' },
                    { value: 'done', label: 'Done' },
                  ]}
                  className="w-32"
                />
              ) : (
                <Select
                  value={task.status}
                  onChange={(e) => onStatusChange(task._id, e.target.value)}
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'review', label: 'Review' },
                    { value: 'done', label: 'Done' },
                  ]}
                  className="w-32"
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function TasksPage() {
  const { user } = useAuthContext();
  const { tasks, isLoading, mutate: mutateTasks } = useTasks();
  const { projects } = useProjects();
  const { developers } = useDevelopers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/tasks', formData);
      toast.success('Task created successfully');
      mutateTasks();
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      mutateTasks();
      toast.success('Task status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) return <LoadingSpinner className="py-12" />;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                >
                  Kanban
                </button>
              </div>
              {user?.role === 'admin' && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              )}
            </div>
          </div>

          {view === 'kanban' ? (
            <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
          ) : (
            <TaskList tasks={tasks} user={user} onStatusChange={handleStatusChange} />
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select
              label="Project"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              options={[
                { value: '', label: 'Select project' },
                ...projects.map((p) => ({ value: p._id, label: p.title })),
              ]}
              required
            />
            <Select
              label="Assign To"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={[
                { value: '', label: 'Select developer' },
                ...developers.map((d) => ({ value: d._id, label: d.name })),
              ]}
              required
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
