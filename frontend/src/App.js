import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DarkModeProvider } from './context/DarkModeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Auth Components
import Login from './components/auths/Login';
import Register from './components/auths/Register';

// Dashboard Component
import Dashboard from './components/Dashboard';

// Project Components
import ProjectList from './components/projects/ProjectList';
import ProjectForm from './components/projects/ProjectForm';

// Invoice Components
import InvoiceList from './components/invoices/InvoiceList';
import InvoiceForm from './components/invoices/InvoiceForm';

// Client Components
import ClientList from './components/clients/ClientList';
import ClientForm from './components/clients/ClientForm';

// Configuration Component
import ConfigurationForm from './components/settings/ConfigurationForm';

// User Management Components
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';

function App() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-white dark:bg-dark-background text-black dark:text-dark-text transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Project routes */}
            <Route path="projects">
              <Route index element={<ProjectList />} />
              <Route path="new" element={<ProjectForm />} />
              <Route path=":id/edit" element={<ProjectForm />} />
            </Route>

            {/* Invoice routes */}
            <Route path="invoices">
              <Route index element={<InvoiceList />} />
              <Route path="new" element={<InvoiceForm />} />
              <Route path=":id/edit" element={<InvoiceForm />} />
            </Route>

            {/* Client routes */}
            <Route path="clients">
              <Route index element={<ClientList />} />
              <Route path="new" element={<ClientForm />} />
              <Route path=":id/edit" element={<ClientForm />} />
            </Route>

            {/* Settings route */}
            <Route path="configuration" element={<ConfigurationForm />} />

            {/* User Management routes (Admin only) */}
            <Route path="users">
              <Route index element={<AdminRoute><UserList /></AdminRoute>} />
              <Route path="new" element={<AdminRoute><UserForm /></AdminRoute>} />
              <Route path="edit/:id" element={<AdminRoute><UserForm /></AdminRoute>} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </DarkModeProvider>
  );
}

export default App;
