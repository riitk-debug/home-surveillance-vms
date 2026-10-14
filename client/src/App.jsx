import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './api.js';
import Login from './pages/Login.jsx';
import Cameras from './pages/Cameras.jsx';

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <>
      {getToken() && (
        <header className="topbar">
          <strong>Home VMS</strong>
          <button onClick={logout}>Log out</button>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Cameras />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
