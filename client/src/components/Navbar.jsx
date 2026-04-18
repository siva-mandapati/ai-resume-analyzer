import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
        Resume<span className="text-gray-800">AI</span>
      </Link>

      <div className="space-x-6 flex items-center font-medium">
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
            <Link to="/upload" className="text-gray-600 hover:text-blue-600 transition">Upload Resume</Link>
            <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
            <Link to="/register" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
