import React from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { ExpenseProvider } from './context/ExpenseContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Your existing dashboard or main content component
const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your expense tracker!</p>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard/*" element={<Layout />} />
              <Route path="expenses/*" element={<Layout />} />
              <Route path="income/*" element={<Layout />} />
              <Route path="customer-payments/*" element={<Layout />} />
              <Route path="customers/*" element={<Layout />} />
              <Route path="employees/*" element={<Layout />} />
              <Route path="landlords/*" element={<Layout />} />
              <Route path="projects/*" element={<Layout />} />
              <Route path="reports/*" element={<Layout />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </ExpenseProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;