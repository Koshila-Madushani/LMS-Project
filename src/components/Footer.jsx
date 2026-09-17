import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#eefbe8', // Fresh Soft Mint Green
      color: '#1f2937',
      padding: '45px 20px 20px 20px',
      marginTop: 'auto',
      borderTop: '4px solid #3ea006'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', textAlign: 'left' }}>
        
        {/* Institute Intro */}
        <div style={{ flex: '1', minWidth: '260px' }}>
          <h3 style={{ color: '#111827', fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
            AuraPen <span style={{ color: '#3ea006' }}>Saku</span>
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#374151' }}>
            Sri Lanka's leading advanced educational institute, shaping the future of students through digital and physical learning.
          </p>
        </div>
        
        {/* Contact Info Card */}
        <div style={{ 
          flex: '1', 
          minWidth: '260px', 
          backgroundColor: '#ffffff', 
          padding: '20px 25px', 
          borderRadius: '12px',
          border: '2px solid #a3e635',
          boxShadow: '0 4px 12px rgba(62, 160, 6, 0.08)'
        }}>
          <h3 style={{ color: '#111827', fontSize: '17px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '2px solid #3ea006', paddingBottom: '4px', display: 'inline-block' }}>
            Contact Information
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: '#1f2937' }}>
            📍 <strong>Address:</strong> Opposite Bandaranayaka College, Mirigama
          </p>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: '#1f2937' }}>
            📞 <strong>Phone:</strong> 075-0898391
          </p>
          <p style={{ fontSize: '14px', color: '#1f2937', margin: 0 }}>
            ✉️ <strong>Email:</strong> info@aurapensaku.lk
          </p>
        </div>

      </div>

      <hr style={{ borderColor: '#bef264', marginBottom: '20px' }} />

      <p style={{ fontSize: '13px', margin: 0, textAlign: 'center', color: '#4b5563', fontWeight: '600' }}>
        &copy; 2026 AuraPen Saku Education Institute. All Rights Reserved.
      </p>
    </footer>
  );
}