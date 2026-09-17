import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Timetable from './components/Timetable.jsx';
import Teachers from './components/Teachers.jsx';
import About from './components/About';
import Contact from './components/Contact';
import LmsDashboard from './components/LmsDashboard.jsx'; 
import StudentDashboard from './components/StudentDashboard.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import Footer from './components/Footer';
import Login from './components/Login';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [userRole, setUserRole] = useState(null); 
  const [userName, setUserName] = useState('User');
  
  const [userUsername, setUserUsername] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userGrade, setUserGrade] = useState('');
  const [userSubjects, setUserSubjects] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);

  const isDashboard = isLoggedIn && currentPage === 'Dashboard';

  const handleLoginSubmit = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8082/api/login', { username, password });

      if (response.data.status === "Success") {
        
        // 🟢 1. LocalStorage එකට User Data Save කරනවා (මේකෙන් Console එකේ `null` වෙන එක නැතිවෙනවා)
        localStorage.setItem('user', JSON.stringify(response.data));

        setIsLoggedIn(true);
        setUserRole(response.data.role); 
        setUserName(response.data.name || response.data.full_name); 
        setUserUsername(response.data.username);
        setUserPhone(response.data.phone);
        setUserAddress(response.data.address);
        setUserId(response.data.id || response.data.user_id);

        if(response.data.role === 'student'){
            setUserGrade(response.data.grade);
            setUserSubjects(response.data.subjects);
            setUserEmail(response.data.email || '');
        } else if(response.data.role === 'teacher') {
            setUserSubjects(response.data.subject); 
            setUserEmail(response.data.email);
        }

        setCurrentPage('Dashboard'); 
        setShowLoginModal(false);
      } else {
        alert(`❌ Login Failed: ${response.data.message || "Invalid Username or Password!"}`);
      }
    } catch (error) {
      alert("❌ Login Failed: Cannot connect to the server!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Session clear කරනවා
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage('Home');
  };

  // 🟢 StudentDashboard එකට Prop එකක් විදිහට Pass කරන්න User Object එක හදාගැනීම:
  const currentUserObj = {
    id: userId,
    name: userName,
    full_name: userName,
    student_name: userName,
    username: userUsername,
    grade: userGrade,
    subjects: userSubjects,
    email: userEmail,
    phone: userPhone,
    address: userAddress,
    role: userRole
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {!isDashboard && (
        <Navbar onLoginClick={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} userName={userName} setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentPage === 'Home' && <Home setCurrentPage={setCurrentPage} />}
        {currentPage === 'Classes' && <Timetable setCurrentPage={setCurrentPage} />}
        {currentPage === 'Teachers' && <Teachers />}
        {currentPage === 'About' && <About />}
        {currentPage === 'Contact' && <Contact />}  {/* 👈 New Contact Page */}
        
        {currentPage === 'Dashboard' && isLoggedIn && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {userRole === 'admin' && <LmsDashboard userName={userName} handleLogout={handleLogout} />}
            
            {userRole === 'teacher' && <TeacherDashboard userName={userName} userUsername={userUsername} subject={userSubjects} email={userEmail} phone={userPhone} address={userAddress} handleLogout={handleLogout} />}
            
            {/* 🟢 FIX: StudentDashboard එකට user Object එකයි onLogout Function එකයි හරියටම Pass කළා */}
            {userRole === 'student' && (
              <StudentDashboard 
                user={currentUserObj} 
                onLogout={handleLogout} 
              />
            )}
          </div>
        )}
      </main>

      {!isDashboard && <Footer />}

      {showLoginModal && (
        <Login setShowLoginModal={setShowLoginModal} handleLoginSubmit={handleLoginSubmit} />
      )}
    </div>
  );
}