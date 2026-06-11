'use client';

import { useState } from 'react';
import { useTasks, useProjects, useDevelopers } from '@/lib/hooks';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

function KanbanBoard({ tasks, onStatusChange }) {
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ];

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, status) => {
    e.preventDefault();
    onStatusChange(e.dataTransfer.getData('taskId'), status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className="bg-gray-50 rounded-xl p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <h3 className="font-semibold text-gray-700 mb-4">{col.label}</h3>
          <div className="space-y-3">
            {tasks.filter((t) => t.status === col.id).map((task) => (
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
}

function TaskList({ tasks, onStatusChange }) {
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
            <Select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              options={STATUS_OPTIONS}
              className="w-32"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateTaskModal({ isOpen, onClose, onSuccess }) {
  const { projects } = useProjects();
  const { developers } = useDevelopers();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', project: '', assignedTo: '', priority: 'medium', dueDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', form);
      toast.success('Task created successfully');
      onSuccess();
      onClose();
      setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', dueDate: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <Select label="Project" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} options={[{ value: '', label: 'Select project' }, ...projects.map((p) => ({ value: p._id, label: p.title }))]} required />
        <Select label="Assign To" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} options={[{ value: '', label: 'Select developer' }, ...developers.map((d) => ({ value: d._id, label: d.name }))]} required />
        <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
        <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function TasksClient() {
  const { user } = useAuthContext();
  const { tasks, isLoading, mutate } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('list');

  const handleStatusChange = async (taskId, status) => {
    const updatedTasks = tasks.map((t) => (t._id === taskId ? { ...t, status } : t));

    mutate(
      { data: { tasks: updatedTasks } },
      { revalidate: false }
    );

    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch (error) {
      mutate({ data: { tasks } }, { revalidate: false });
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
                {['list', 'kanban'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize
                      ${view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {user?.role === 'admin' && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />New Task
                </Button>
              )}
            </div>
          </div>

          {view === 'kanban' ? (
            <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
          ) : (
            <TaskList tasks={tasks} onStatusChange={handleStatusChange} />
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12"><p className="text-gray-500">No tasks found</p></div>
          )}
        </div>

        <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={mutate} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
