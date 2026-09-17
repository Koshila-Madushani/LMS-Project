import React, { useState } from 'react';
import axios from 'axios';

export default function ResetPasswordModal({ userName, setShowResetModal }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8081/api/change-password', {
            username: userName,
            currentPassword: currentPassword,
            newPassword: newPassword
        }).then(res => {
            if (res.data.status === "Success") {
                alert("✅ Password changed successfully!");
                setShowResetModal(false); // සාර්ථක වුණාම Modal එක වැහෙනවා
            } else {
                alert("❌ " + res.data.message);
            }
        }).catch(err => alert("❌ Server Error!"));
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                
                <h3 style={{ marginTop: 0, color: '#15803d', fontSize: '20px', fontWeight: 'bold' }}>Change Password</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Enter your current password and the new password below.</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input 
                        type="password" 
                        placeholder="Current Password" 
                        required 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                    />
                    
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        required 
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                    />
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Cancel
                        </button>
                        <button type="submit" style={{ flex: 1, padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Change Now
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}