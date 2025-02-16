import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('PrivateRoute - Token:', token); // Debug log
  if (!token) {
    console.log('Redirecting to login...'); // Debug log
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('PublicRoute - Token:', token); // Debug log
  if (token) {
    console.log('Redirecting to notes...'); // Debug log
    return <Navigate to="/notes" replace />;
  }
  return children;
};

function App() {
  console.log('Current token:', localStorage.getItem('token')); // Debug log
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/notes" replace />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          } 
        />
        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 