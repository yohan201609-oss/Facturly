import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import InvoiceView from './pages/InvoiceView';
import { Toaster } from 'sonner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/clients" element={
          <PrivateRoute>
            <Clients />
          </PrivateRoute>
        } />

        <Route path="/invoices" element={
          <PrivateRoute>
            <Invoices />
          </PrivateRoute>
        } />

        <Route path="/invoices/new" element={
          <PrivateRoute>
            <InvoiceForm />
          </PrivateRoute>
        } />

        <Route path="/invoices/:id/edit" element={
          <PrivateRoute>
            <InvoiceForm />
          </PrivateRoute>
        } />

        <Route path="/invoices/:id/view" element={
          <PrivateRoute>
            <InvoiceView />
          </PrivateRoute>
        } />

        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
