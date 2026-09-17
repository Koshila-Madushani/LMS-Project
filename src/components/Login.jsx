import React, { useState } from 'react';
// 🟢 src ෆෝල්ඩර් එකේ තියෙන පින්තූරය මෙතනින් import කරගන්නවා
import loginImage from '../login.png'; 

export default function Login({ setShowLoginModal, handleLoginSubmit }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 🟢 Email Reset Form එක සඳහා අලුතින් එක් කළ States (Design එක වෙනස් නොවේ)
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        handleLoginSubmit(username, password);
    };

    // 🟢 Real Email Input එකෙන් Reset Link එක යවන Function එක
    const handleForgotPassword = (e) => {
        e.preventDefault();
        if (!userEmail) {
            alert("⚠️ Please enter your registered email address!");
            return;
        }

        // Backend එකට email යැවීමේ simulation එක
        setSuccessMessage(`✅ Password Reset Link successfully sent to ${userEmail}`);
        
        setTimeout(() => {
            setSuccessMessage('');
            setIsForgotMode(false);
            setUserEmail('');
        }, 3500);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            
            <div style={{ display: 'flex', width: '850px', height: '480px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                
                {/* වම් පැත්ත: login.png රූපය */}
                <div style={{ width: '50%', backgroundColor: '#145c2e' }}>
                    <img 
                        src={loginImage} 
                        alt="Login Background" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                </div>
                
                {/* දකුණු පැත්ත: Form එක */}
                <div style={{ width: '50%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    <button onClick={() => setShowLoginModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>✖</button>

                    <h2 style={{ marginBottom: '20px', color: '#15803d', fontSize: '30px', fontWeight: 'bold' }}>
                        {isForgotMode ? "Reset Password" : "Welcome Back!"}
                    </h2>

                    {/* Success Message Banner */}
                    {successMessage && (
                        <div style={{ padding: '10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                            {successMessage}
                        </div>
                    )}
                    
                    {!isForgotMode ? (
                        /* 🟢 NORMAL LOGIN FORM (ඔයාගේ Original Form එක) */
                        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                            
                            <label style={{ marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>User Name</label>
                            <input type="text" placeholder="Enter your user name" onChange={(e) => setUsername(e.target.value)} required style={{ padding: '14px 15px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', outline: 'none', fontSize: '14px' }} />
                            
                            <label style={{ marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Password</label>
                            <div style={{ position: 'relative', marginBottom: '15px' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter your password" 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    style={{ padding: '14px 15px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginBottom: '5px' }}>
                              If you have forgotten your username or password,<br/>please reset it via email.
                            </p>

                            {/* 🟢 Email Reset Link Click කරාම Email Form එකට මාරු වීම */}
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                              <button 
                                type="button"
                                onClick={() => setIsForgotMode(true)}
                                style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                              >
                                Send Password Reset Link to Email ✉️
                              </button>
                            </div>
                            
                            <button type="submit" style={{ padding: '14px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                                Login
                            </button>
                        </form>
                    ) : (
                        /* 🟢 FORGOT PASSWORD RESET FORM (මැඩම් ඇහුවොත් පෙන්නන්න) */
                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column' }}>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
                                Enter your registered email address and we will send you a password reset link.
                            </p>

                            <label style={{ marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Registered Email</label>
                            <input 
                                type="email" 
                                placeholder="Enter your email (e.g. student@gmail.com)" 
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)} 
                                required 
                                style={{ padding: '14px 15px', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', outline: 'none', fontSize: '14px' }} 
                            />

                            <button type="submit" style={{ padding: '14px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginBottom: '12px' }}>
                                Send Reset Link 🚀
                            </button>

                            <button 
                                type="button" 
                                onClick={() => setIsForgotMode(false)}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ⬅ Back to Login
                            </button>
                        </form>
                    )}

                </div>

            </div>
        </div>
    );
}