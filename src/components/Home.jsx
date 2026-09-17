import React from 'react';
import Hero from './Hero';
import Features from './Features';

export default function Home({ setCurrentPage }) {
  return (
    <div>
      <Hero setCurrentPage={setCurrentPage} />
      
      {/* Bright Vibrant Mint Banner */}
      <div style={{ 
        backgroundColor: '#eefbe8', 
        padding: '35px 20px', 
        borderTop: '3px solid #3ea006',
        borderBottom: '3px solid #3ea006'
      }}>
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          display: 'flex', 
          justify: 'space-around', 
          flexWrap: 'wrap', 
          gap: '20px', 
          textAlign: 'center' 
        }}>
          
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px 30px',
            borderRadius: '12px',
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(62, 160, 6, 0.12)',
            border: '2px solid #a3e635'
          }}>
            <h2 style={{ fontSize: '38px', margin: '0 0 5px 0', color: '#3ea006', fontWeight: '800' }}>9+</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#1f2937', fontWeight: '700' }}>Expert Subject Teachers</p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px 30px',
            borderRadius: '12px',
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(62, 160, 6, 0.12)',
            border: '2px solid #a3e635'
          }}>
            <h2 style={{ fontSize: '38px', margin: '0 0 5px 0', color: '#3ea006', fontWeight: '800' }}>Modern</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#1f2937', fontWeight: '700' }}>Physical & Digital Classrooms</p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px 30px',
            borderRadius: '12px',
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(62, 160, 6, 0.12)',
            border: '2px solid #a3e635'
          }}>
            <h2 style={{ fontSize: '38px', margin: '0 0 5px 0', color: '#3ea006', fontWeight: '800' }}>100%</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#1f2937', fontWeight: '700' }}>Individual Student Attention</p>
          </div>

        </div>
      </div>

      <Features />
    </div>
  );
}