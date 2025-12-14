import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} ChatApp. All Rights Reserved.</p>
        <div>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-light mx-2">
            <i className="bi bi-github" style={{ fontSize: '1.5rem' }}></i> GitHub
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-light mx-2">
            <i className="bi bi-linkedin" style={{ fontSize: '1.5rem' }}></i> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
