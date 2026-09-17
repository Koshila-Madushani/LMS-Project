import React from 'react';
import classBg from '../class.jpg';

export default function Hero({ setCurrentPage }) {
  return (
    <div style={{
      position: 'relative',
      padding: '110px 20px',
      textAlign: 'center',
      color: '#ffffff',
      // Much Lighter Overlay (0.35 & 0.45) for Original Brightness:
      backgroundImage: `linear-gradient(rgba(15, 60, 32, 0.38), rgba(20, 83, 45, 0.48)), url(${classBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <span style={{
          backgroundColor: '#ffffff',
          color: '#15803d',
          padding: '8px 22px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.8px',
          display: 'inline-block',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          🎓 EXCELLENCE IN SECONDARY & HIGHER EDUCATION
        </span>

        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '18px', 
          fontWeight: '800', 
          lineHeight: '1.2',
          textShadow: '0 3px 15px rgba(0,0,0,0.85)',
          color: '#ffffff'
        }}>
          AuraPen Saku Education Institute
        </h1>
        
        <p style={{ 
          fontSize: '17.5px', 
          marginBottom: '35px', 
          color: '#ffffff', 
          maxWidth: '680px', 
          margin: '0 auto 35px auto', 
          lineHeight: '1.7',
          fontWeight: '600',
          textShadow: '0 2px 10px rgba(0,0,0,0.85)'
        }}>
          Shaping academic futures through structured guidance, expert faculty, and modern digital learning tools. Explore our physical and digital class modules today.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setCurrentPage('Classes')}
            style={{
              padding: '14px 32px', fontSize: '15px', fontWeight: 'bold', color: '#15803d', backgroundColor: '#ffffff',
              border: 'none', borderRadius: '30px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            📚 Explore Courses
          </button>
          
          <button 
            onClick={() => setCurrentPage('Contact')}
            style={{
              padding: '14px 32px', fontSize: '15px', fontWeight: 'bold', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.4)',
              border: '2px solid #ffffff', borderRadius: '30px', cursor: 'pointer', transition: '0.3s', backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            📞 Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}