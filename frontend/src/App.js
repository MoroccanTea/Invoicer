import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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


function App() {
  return (
    <>
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
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </>
  );
}

export default App;
