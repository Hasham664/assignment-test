'use client';

import { useState } from 'react';
import { useProjects, useDevelopers } from '@/lib/hooks';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const { developers } = useDevelopers();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', assignedDevelopers: [] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created successfully');
      onSuccess();
      onClose();
      setForm({ title: '', description: '', dueDate: '', assignedDevelopers: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const toggleDeveloper = (devId) => {
    setForm((prev) => ({
      ...prev,
      assignedDevelopers: prev.assignedDevelopers.includes(devId)
        ? prev.assignedDevelopers.filter((id) => id !== devId)
        : [...prev.assignedDevelopers, devId],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Project title"
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Project description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Assign Developers</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {developers.map((dev) => (
              <label key={dev._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.assignedDevelopers.includes(dev._id)}
                  onChange={() => toggleDeveloper(dev._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{dev.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}

function ProjectCard({ project }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {project.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(project.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.assignedDevelopers?.length || 0} devs</span>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">Created by {project.createdBy?.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsClient() {
  const { user } = useAuthContext();
  const { projects, isLoading, mutate } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return <LoadingSpinner className="py-12" />;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            {user?.role === 'admin' && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />New Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12"><p className="text-gray-500">No projects found</p></div>
          )}
        </div>

        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={mutate}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
