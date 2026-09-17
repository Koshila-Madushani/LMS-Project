import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import logo from '../logo.png'; // ⚠️ logo path එක නිවැරදිද බලන්න

// වෙනම ෆයිල් වල තියෙන සියලුම මොඩියුලයන් මෙතනට Import කරගැනීම
import TeacherContent from './TeacherContent';
import TeacherQuiz from './TeacherQuiz';
import TeacherActivities from './TeacherActivities';
import ViewReports from './TeacherReports';
import TeacherQuestionBank from './TeacherQuestionBank'; 
import TeacherProfileSettings from './TeacherProfileSettings'; 
import Teacherfeedback from './Teacherfeedback';

const axiosInstance = axios;

export default function TeacherDashboard({ userName, userUsername, subject, qualifications, email, phone, address, handleLogout }) {
  // 🎯 Shared Sidebar එකේ Menu Names එකට හරියන පරිදි Tab Keys සෙට් කළා
  const [activeTab, setActiveTab] = useState('Dashboard Overview');
  const [materials, setMaterials] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [preSelectedGrade, setPreSelectedGrade] = useState(null);

  const fullSubject = subject || 'Grade 8 - Mathematics'; 
  const subjectParts = fullSubject.split(' - ');
  const teachingSubject = subjectParts.length > 1 ? subjectParts[1] : fullSubject;

  // @ts-ignore ගුරුවරයාට අදාළ ශ්‍රේණි ලැයිස්තුව ඩයිනමික්ව සකසා ගැනීම
  const teacherGrades = Array.isArray(timetable) ? [...new Set(timetable.map(c => c.grade))] : [];
  const uniqueAssignedGrades = teacherGrades.length > 0 ? teacherGrades.join(', ') : 'Not Assigned Yet';

  const fetchData = () => {
    axiosInstance.get('http://localhost:8082/api/learning-materials').then(res => setMaterials(Array.isArray(res.data) ? res.data : []));
    axiosInstance.get('http://localhost:8082/api/timetable').then(res => setTimetable(Array.isArray(res.data) ? res.data.filter(c => c.teacher === userName) : []));
  };

  useEffect(() => { fetchData(); }, [userName]);

  // 🎯 වෙනම තියෙන ෆයිල් ටික ටැබ්ස් අනුව ලස්සනට රෙන්ඩර් කරන කොටස
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard Overview':
        return (
          <div>
            <div style={{ backgroundColor: '#15803d', padding: '30px', borderRadius: '15px', color: 'white', marginBottom: '30px' }}>
              <h1>Welcome back, {userName}! 👋</h1>
              <p>System operational for target assigned structures: <strong>{uniqueAssignedGrades} ({teachingSubject})</strong></p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <DashboardCard title="Active Subject" count={teachingSubject} icon="📚" textColor="#3b82f6" />
              <DashboardCard title="Assigned Grades" count={uniqueAssignedGrades} icon="🏫" textColor="#7c3aed" />
              <DashboardCard title="Total Resources" count={materials.filter(m => m.subject === teachingSubject).length} icon="📂" textColor="#eab308" />
            </div>
            <h3>🏫 Active Scheduled Timetable Mapping</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '-5px', marginBottom: '15px' }}>💡 Quick Action: Click any card below to instantly open Content Manager targeted for that grade.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {timetable.map(c => (
                  <div key={c.id} onClick={() => { setPreSelectedGrade(c.grade); setActiveTab('Content Manager'); }} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderTop: '5px solid #15803d', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.grade} - {c.subject}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>🕒 {c.day} ({c.time_slot})</div>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'Content Manager': 
        return <TeacherContent userName={userName} teachingSubject={teachingSubject} materials={materials} fetchData={fetchData} timetable={timetable} preSelectedGrade={preSelectedGrade} setPreSelectedGrade={setPreSelectedGrade} teacherGrades={teacherGrades} />;
      
      case 'Quiz & Exam Manager': 
        return <TeacherQuiz userName={userName} subject={fullSubject} qualifications={qualifications} teacherGrades={teacherGrades} timetable={timetable} />;
      
      case 'Question Bank':
        return <TeacherQuestionBank userName={userName} teacherGrades={teacherGrades} timetable={timetable} />;

      case 'Forum & Activity Hub':
        return <TeacherActivities timetable={timetable} teachingSubject={teachingSubject} userName={userName} />;

      case 'View Reports': 
        return <ViewReports subject={fullSubject} />;

      case 'Student Feedback':
        return <Teacherfeedback userName={userName} subject={teachingSubject} />;
        
      case 'My Profile Settings':
        return (
          <TeacherProfileSettings 
            userName={userName} 
            userUsername={userUsername} 
            subject={teachingSubject} 
            qualifications={qualifications} 
            email={email} 
            phone={phone} 
            address={address} 
            handleLogout={handleLogout} 
          />
        );
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 Top Header Section with Logo */}
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={{ height: '58px', width: 'auto' }} /> 
        <div style={styles.welcomeText}>
          Welcome, {userName || 'Teacher'} 🧑‍🏫
        </div>
      </header>

      {/* Main Layout Splitter */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          currentSubPage={activeTab} 
          setCurrentSubPage={setActiveTab} 
          onLogoutClick={handleLogout} 
          role="teacher"
        />

        {/* Main Content Render Area */}
        <div style={{ flex: 1, padding: '40px 50px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
          {renderContent()}
        </div>
      </div>

    </div>
  );
}

const DashboardCard = ({ title, count, icon, textColor }) => (
  <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `5px solid ${textColor}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
    <div><p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>{title}</p><h2 style={{ fontSize: '18px', whiteSpace: 'normal', wordBreak: 'break-word', marginTop: '5px' }}>{count}</h2></div>
    <div style={{ fontSize: '28px' }}>{icon}</div>
  </div>
);

const styles = {
  header: {
    height: '80px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    borderBottom: '1px solid #e2e8f0',
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
  },
  welcomeText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  }
};