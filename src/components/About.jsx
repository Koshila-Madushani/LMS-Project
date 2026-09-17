import React from 'react';

export default function About() {
  return (
    <div style={{ padding: '60px 20px', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Main Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>
            About AuraPen <span style={{ color: '#3ea006' }}>Saku</span>
          </h2>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.8', maxWidth: '780px', margin: '0 auto' }}>
            Located conveniently opposite Bandaranayaka College in Mirigama, AuraPen Saku Education Institute is dedicated to providing high-quality educational guidance for students from Grade 6 up to G.C.E. Advanced Level.
          </p>
        </div>

        {/* Vision, Mission & Why Choose Us Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '25px' }}>
          
          {/* Vision Card */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '30px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
            border: '1px solid #e2e8f0', 
            borderTop: '5px solid #3ea006' 
          }}>
            <h3 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '12px', fontWeight: 'bold' }}>
              🎯 Our Vision
            </h3>
            <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.7', margin: 0 }}>
              To empower the next generation with structured knowledge, practical digital learning solutions, and direct student-focused coaching to excel in national examinations.
            </p>
          </div>

          {/* Mission Card */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '30px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
            border: '1px solid #e2e8f0', 
            borderTop: '5px solid #16a34a' 
          }}>
            <h3 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '12px', fontWeight: 'bold' }}>
              🚀 Our Mission
            </h3>
            <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.7', margin: 0 }}>
              To deliver high-caliber teaching through experienced educators, modern LMS technologies, and continuous academic assessment—fostering excellence in every student.
            </p>
          </div>

          {/* Why Choose Us Card */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '30px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
            border: '1px solid #e2e8f0', 
            borderTop: '5px solid #22c55e' 
          }}>
            <h3 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '12px', fontWeight: 'bold' }}>
              ⭐ Why Choose Us?
            </h3>
            <ul style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
              <li>Experienced secondary and A/L syllabus experts.</li>
              <li>Focused individual classroom tracking.</li>
              <li>Seamless LMS digital integration.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}