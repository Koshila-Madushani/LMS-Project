import React from 'react';

export default function Navbar({ onLoginClick, isLoggedIn, studentName, setCurrentPage, currentPage }) {
  const getStyle = (page) => ({
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    color: currentPage === page ? '#15803d' : '#475569',
    borderBottom: currentPage === page ? '2.5px solid #15803d' : 'none',
    paddingBottom: '4px',
    transition: '0.2s'
  });

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 40px', 
      backgroundColor: '#ffffff', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      
      {/* Logo */}
      <div style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('Home')}>
        <img src={require('../logo.png')} alt="Logo" style={{ height: '70px', width: 'auto' }} />
      </div>
      
      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '30px' }}>
        <span style={getStyle('Home')} onClick={() => setCurrentPage('Home')}>Home</span>
        <span style={getStyle('Classes')} onClick={() => setCurrentPage('Classes')}>Classes</span>
        <span style={getStyle('Teachers')} onClick={() => setCurrentPage('Teachers')}>Teachers</span>
        <span style={getStyle('About')} onClick={() => setCurrentPage('About')}>About</span>
        <span style={getStyle('Contact')} onClick={() => setCurrentPage('Contact')}>Contact</span> {/* 👈 මෙන්න Contact Link එක දාලා තියෙන්නේ */}
      </div>

      {/* Login Button / User Profile */}
      <div>
        {!isLoggedIn ? (
          <button onClick={onLoginClick} style={{ 
            padding: '9px 26px', 
            backgroundColor: '#15803d', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '15px', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(21, 128, 61, 0.2)'
          }}>
            Login
          </button>
        ) : (
          <span style={{ fontWeight: '600', color: '#15803d', fontSize: '16px' }}>👤 {studentName}</span>
        )}
      </div>
    </nav>
  );
}