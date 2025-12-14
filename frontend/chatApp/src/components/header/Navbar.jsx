import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // If you're using React Router for navigation
import {Button} from "../index"
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutSession } from '../../appFeatures/auth/authSlice';

const Navbar = () => {
   const navigate = useNavigate();
    const dispatch = useDispatch()
  const {user} = useSelector((s) => s.auth);


    const handleLogout = async ()=>{
    try {
      await dispatch(logoutSession());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
  
    }
  };
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          ChatApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            

             {/* Conditionally render Login/Register or Logout based on authentication status */}
             {!user?(
              <>
                <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </li>
              </>
             ):(
              <>
              <li className="nav-item">
              <Link className="nav-link" to="/chats">
                Chats
              </Link>
            </li>
            <li className="nav-item">
                  <span className="nav-link">Welcome, {user?.username}</span> {/* Display username */}
                </li>

                <li className="nav-item">
                <Button onClick={handleLogout} className="nav-link">
                  Logout
                </Button>
              </li>
              </>
             )}
          
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
