import React from 'react';

export default function Features() {
  const featureList = [
    { icon: "👨‍🏫", title: "Expert Teachers", desc: "Learn from highly qualified secondary and A/L syllabus experts." },
    { icon: "📄", title: "Paper Discussions", desc: "Targeted past paper and model paper revision discussions." },
    { icon: "🏫", title: "Spacious Classrooms", desc: "Modern, comfortable, and well-managed learning environment." },
    { icon: "💻", title: "Integrated LMS", desc: "Access study notes, quizzes, and class schedules online anytime." }
  ];

  return (
    <div style={{ padding: '60px 20px', backgroundColor: '#f1f5f9' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', color: '#1f2937', fontWeight: '800', margin: '0 0 10px 0' }}>
          Why Choose AuraPen <span style={{ color: '#3ea006' }}>Saku</span>?
        </h2>
        <p style={{ fontSize: '15.5px', color: '#4b5563', margin: 0, fontWeight: '500' }}>
          Providing the best learning experience for secondary and advanced level students.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {featureList.map((f, index) => (
          <div key={index} style={{
            width: '230px', padding: '30px 20px', textAlign: 'center', borderRadius: '16px',
            backgroundColor: '#ffffff', boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            borderTop: '5px solid #3ea006', border: '1px solid #e2e8f0', borderTopWidth: '5px'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '15px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '10px', fontWeight: 'bold' }}>{f.title}</h3>
            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}