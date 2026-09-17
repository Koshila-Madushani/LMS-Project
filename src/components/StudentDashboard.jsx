import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import logo from '../logo.png';

// Modular Student Sub-Components
import StudentMaterials from './StudentMaterials';
import StudentActivities from './StudentActivities';
import StudentExams from './StudentExams';
import Studentfeedback from './Studentfeedback';
import StudentProfileSettings from './StudentProfileSettings';

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [materialsCount, setMaterialsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  
  // 🟢 phpMyAdmin Database එකේ තියෙන Exact Default Announcements (Fallback Data)
  const defaultAnnouncements = [
    {
      id: 1,
      type: 'Exam Notification',
      title: '1st Term Online Evaluations Active',
      description: 'Check the Exams & Quizzes tab to attempt your grade 8 term evaluation paper.',
      date_posted: '2026-07-22'
    },
    {
      id: 2,
      type: 'Learning Content',
      title: 'New Lesson Notes Uploaded',
      description: 'Teachers have uploaded new PDF notes and video explanations for Mathematics and Science.',
      date_posted: '2026-07-22'
    }
  ];

  const [announcements, setAnnouncements] = useState(defaultAnnouncements);

  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const currentUser = { ...savedUser, ...user };

  const studentName = currentUser?.full_name || currentUser?.name || currentUser?.student_name || currentUser?.username || "Student";
  const studentGrade = currentUser?.grade || "Grade 8";

  const rawSubjects = currentUser?.subjects;
  const studentSubjects = rawSubjects 
    ? (Array.isArray(rawSubjects) ? rawSubjects : String(rawSubjects).split(',').map(s => s.trim()).filter(Boolean)) 
    : ["Mathematics", "Science", "English"];

  useEffect(() => {
    axios.get('http://localhost:8082/api/learning-materials')
      .then(res => setMaterialsCount((res.data || []).length))
      .catch(() => setMaterialsCount(7));

    axios.get('http://localhost:8082/api/quizzes')
      .then(res => setQuizzesCount((res.data || []).length))
      .catch(() => setQuizzesCount(1));

    // 🟢 Dynamic Announcements Fetching with Live Database Fallback
    axios.get('http://localhost:8082/api/announcements')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setAnnouncements(res.data);
        } else {
          setAnnouncements(defaultAnnouncements);
        }
      })
      .catch(() => setAnnouncements(defaultAnnouncements));
  }, []);

  const handleSubjectClick = (sub) => {
    setSelectedSubject(sub);
    setActiveTab('Study Materials');
  };

  const renderContent = () => {
    const updatedUser = { ...currentUser, name: studentName, full_name: studentName, grade: studentGrade };

    switch (activeTab) {
      case 'Overview':
        return (
          <div>
            {/* Banner */}
            <div style={styles.banner}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Welcome back, {studentName}! 🎓</h1>
              <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#e2e8f0', opacity: 0.9 }}>
                Access your personalized classroom workflows, learning modules, and online exams.
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '24px' }}>
              {[
                { label: 'Assigned Grade', val: studentGrade, color: '#8b5cf6', textCol: '#6d28d9' },
                { label: 'Enrolled Courses', val: `${studentSubjects.length} Subjects`, color: '#f59e0b', textCol: '#d97706' },
                { label: 'Study Materials', val: `${materialsCount} Items`, color: '#145c2e', textCol: '#145c2e' },
                { label: 'Available Exams', val: `${quizzesCount} Quizzes`, color: '#3b82f6', textCol: '#1d4ed8' }
              ].map((card, i) => (
                <div key={i} style={{ ...styles.statCard, borderLeft: `5px solid ${card.color}` }}>
                  <p style={styles.statLabel}>{card.label}</p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: card.textCol }}>{card.val}</h3>
                </div>
              ))}
            </div>

            {/* Subject Shortcuts */}
            <div style={styles.whiteBox}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#145c2e' }}>
                📌 Quick Access - Select Subject to View Materials:
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {studentSubjects.map((sub, idx) => (
                  <button key={idx} onClick={() => handleSubjectClick(sub)} style={styles.pillBtn}>
                    📖 {sub} (Go to Subject)
                  </button>
                ))}
              </div>
            </div>

            {/* 🟢 DYNAMIC NOTICE BOARD */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '22px', marginTop: '24px' }}>
              
              {/* Notice List */}
              <div style={styles.whiteBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 'bold' }}>
                    📢 Institute Announcements & Notice Board
                  </h3>
                  <span style={{ fontSize: '11px', backgroundColor: '#f0fdf4', color: '#145c2e', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                    Live DB Updates
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {announcements.map((item) => (
                    <div key={item.id} style={styles.noticeCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                          📢 {item.type || 'Notice'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>
                          {item.date_posted ? new Date(item.date_posted).toLocaleDateString() : '2026-07-22'}
                        </span>
                      </div>
                      <h4 style={{ margin: '6px 0 4px 0', fontSize: '14.5px', color: '#0f172a', fontWeight: '800' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div style={styles.whiteBox}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b', fontWeight: 'bold', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                  🎯 Quick Shortcuts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => setActiveTab('Lesson Activities')} style={styles.shortcutBtn}>
                    🧩 Practice Lesson Activities
                  </button>
                  <button onClick={() => setActiveTab('Exams & Quizzes')} style={styles.shortcutBtn}>
                    📝 Take Online Exams
                  </button>
                  <button onClick={() => setActiveTab('Feedback')} style={styles.shortcutBtn}>
                    💬 Contact Subject Teacher
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      case 'Study Materials':
        return <StudentMaterials user={updatedUser} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />;
      case 'Lesson Activities':
        return <StudentActivities user={updatedUser} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />;
      case 'Exams & Quizzes':
        return <StudentExams user={updatedUser} />;
      case 'Feedback':
        return <Studentfeedback user={updatedUser} />;
      case 'Settings':
        return <StudentProfileSettings user={updatedUser} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Top Header */}
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={{ height: '58px', width: 'auto' }} /> 
        <div style={styles.welcomeText}>
          Welcome, {studentName} 🎓
        </div>
      </header>

      {/* Main Layout Splitter */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          currentSubPage={activeTab} 
          setCurrentSubPage={setActiveTab} 
          onLogoutClick={onLogout} 
          role="student"
        />
        <div style={styles.mainContent}>
          {renderContent()}
        </div>
      </div>

    </div>
  );
}

const styles = {
  header: { height: '80px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  welcomeText: { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  mainContent: { flex: 1, padding: '28px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' },
  banner: { backgroundColor: '#145c2e', borderRadius: '16px', padding: '24px 30px', color: 'white', marginBottom: '24px', boxShadow: '0 10px 20px -5px rgba(20, 92, 46, 0.25)' },
  whiteBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' },
  statCard: { backgroundColor: '#fff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  statLabel: { margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' },
  pillBtn: { padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f0fdf4', color: '#145c2e', border: 'none', transition: 'all 0.2s' },
  noticeCard: { padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #15803d' },
  shortcutBtn: { width: '100%', padding: '12px', backgroundColor: '#f0fdf4', color: '#145c2e', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }
};