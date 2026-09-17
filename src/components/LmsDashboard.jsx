import React, { useState } from 'react';
import ManageTeachers from './ManageTeachers';
import ManageStudents from './ManageStudents';
import ManageSubjects from './ManageSubjects';
import ManageTimetable from './ManageTimetable'; 
import Sidebar from './Sidebar';
import logo from '../logo.png';
import DashboardOverview from './DashboardOverview';
import ManageReports from './ManageReports'; 
import ManageFeedback from './ManageFeedback'; 
import ManageSettings from './ManageSettings'; 

export default function LmsDashboard({ userName, handleLogout }) {
  const [currentSubPage, setCurrentSubPage] = useState('Overview');

  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'Overview': return <DashboardOverview />;
      case 'Manage Teachers': return <ManageTeachers />;
      case 'Manage Students': return <ManageStudents />;
      case 'Manage Subjects': return <ManageSubjects />;
      case 'Manage Timetable': return <ManageTimetable />;  
      case 'Reports': return <ManageReports />;
      case 'Feedback': return <ManageFeedback />;
      case 'Settings': return <ManageSettings />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
      
      {/* 🟢 Top Header Section with Logo */}
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={{ height: '58px', width: 'auto' }} /> 
        <div style={styles.welcomeText}>
          Welcome, {userName || 'Admin'} 👋
        </div>
      </header>

      {/* Main Layout Splitter */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          currentSubPage={currentSubPage} 
          setCurrentSubPage={setCurrentSubPage} 
          onLogoutClick={handleLogout} 
          role="admin"
        />

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', height: '100%' }}>
          {renderSubPage()}
        </div>
      </div>
    </div>
  );
}

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