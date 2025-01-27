import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error(error.message || 'Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Error deleting project');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 dark:bg-dark-background dark:text-dark-text">Loading...</div>;
  }

  return (
    <div className="p-6 dark:bg-dark-background dark:text-dark-text">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Link
          to="/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="p-4 border rounded-lg shadow bg-white dark:bg-dark-secondary dark:border-gray-700">
            <h3 className="text-lg font-semibold dark:text-white">{project.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {project.client?.name || 'No client assigned'}
              {project.client?.company && ` (${project.client.company})`}
            </p>
            <div className="mt-2 space-y-2">
              <span className={`px-2 py-1 rounded text-sm ${project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              <div className="mt-4 flex space-x-4">
                <Link
                  to={`/projects/${project._id}/edit`}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
