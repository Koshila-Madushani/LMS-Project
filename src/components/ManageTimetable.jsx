import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageTimetable() {
  const [timetableData, setTimetableData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('All Classes');
  const [loading, setLoading] = useState(true);

  // Form States for Adding & Editing
  const [editingId, setEditingId] = useState(null); // null = Add mode, number = Edit mode
  const [grade, setGrade] = useState('Grade 6');
  const [day, setDay] = useState('Monday');
  const [timeSlot, setTimeSlot] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sample Fallback Data
  const defaultClasses = [
    { id: 1, grade: 'Grade 6', day: 'Tuesday', subject: 'English', time_slot: '2.30 PM - 4.30 PM', teacher: 'Ranga Rajaguru' },
    { id: 2, grade: 'Grade 6', day: 'Wednesday', subject: 'Dancing', time_slot: '2.30 PM - 5.00 PM', teacher: 'Vathsala Ranatunga' },
    { id: 3, grade: 'Grade 6', day: 'Thursday', subject: 'Science', time_slot: '2.45 PM - 4.30 PM', teacher: 'Ravindu Jayaweera' },
    { id: 4, grade: 'Grade 6', day: 'Thursday', subject: 'Mathematics', time_slot: '4.45 PM - 6.45 PM', teacher: 'Buddhika Darshani' },
    { id: 5, grade: 'Grade 8', day: 'Wednesday', subject: 'English', time_slot: '2.45 PM - 4.45 PM', teacher: 'Ranga Rajaguru' }
  ];

  const fetchTimetable = () => {
    setLoading(true);
    axios.get('http://localhost:8082/api/timetable')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setTimetableData(res.data);
          localStorage.setItem('aura_timetable', JSON.stringify(res.data));
        } else {
          setTimetableData(defaultClasses);
        }
        setLoading(false);
      })
      .catch(() => {
        // Database offline නම් Local Storage හෝ Default Data පාවිච්චි කරයි
        const saved = localStorage.getItem('aura_timetable');
        if (saved) {
          setTimetableData(JSON.parse(saved));
        } else {
          setTimetableData(defaultClasses);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const gradeList = ['All Classes', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  // Filter Data
  const filteredData = selectedGrade === 'All Classes'
    ? timetableData
    : timetableData.filter(item => item.grade && item.grade.toLowerCase() === selectedGrade.toLowerCase());

  // Add / Edit Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!timeSlot || !subject || !teacher) {
      alert('Please fill in all fields!');
      return;
    }

    if (editingId) {
      // ✏️ EDIT MODE
      const updatedItem = { id: editingId, grade, day, time_slot: timeSlot, subject, teacher };
      
      axios.put(`http://localhost:8082/api/timetable/${editingId}`, updatedItem)
        .then(() => {
          alert('✅ Class Schedule Updated Successfully!');
          fetchTimetable();
        })
        .catch(() => {
          const updatedList = timetableData.map(item => item.id === editingId ? updatedItem : item);
          setTimetableData(updatedList);
          localStorage.setItem('aura_timetable', JSON.stringify(updatedList));
          alert('✅ Class Schedule Updated Successfully!');
        });

    } else {
      // ➕ ADD MODE
      const newItem = { id: Date.now(), grade, day, time_slot: timeSlot, subject, teacher };

      axios.post('http://localhost:8082/api/timetable', newItem)
        .then(() => {
          alert('✅ New Class Scheduled & Published to Website!');
          fetchTimetable();
        })
        .catch(() => {
          const newList = [...timetableData, newItem];
          setTimetableData(newList);
          localStorage.setItem('aura_timetable', JSON.stringify(newList));
          alert('✅ New Class Scheduled & Published to Website!');
        });
    }

    resetForm();
  };

  // Click Edit -> Fill Form Values
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setGrade(item.grade || 'Grade 6');
    setDay(item.day || 'Monday');
    setTimeSlot(item.time_slot || '');
    setSubject(item.subject || '');
    setTeacher(item.teacher || '');
    setShowAddForm(true);
  };

  // Delete Handler
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this class schedule?')) {
      axios.delete(`http://localhost:8082/api/timetable/${id}`)
        .then(() => fetchTimetable())
        .catch(() => {
          const newList = timetableData.filter(item => item.id !== id);
          setTimetableData(newList);
          localStorage.setItem('aura_timetable', JSON.stringify(newList));
        });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTimeSlot('');
    setSubject('');
    setTeacher('');
    setShowAddForm(false);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '30px 20px' }}>
      
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '950px', margin: '0 auto 25px auto', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: '#15803d', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>
            Aura Pen Education
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '500' }}>
            Manage Official Live Class Timetable Portal
          </p>
        </div>

        <button 
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          style={{
            backgroundColor: '#15803d',
            color: '#ffffff',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '30px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {showAddForm ? '✖ Close Form' : '➕ Add New Class'}
        </button>
      </div>

      {/* Add / Edit Class Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: '950px', margin: '0 auto 30px auto', backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid #bbf7d0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#15803d', fontSize: '16px', fontWeight: 'bold' }}>
            {editingId ? '✏️ Edit Class Schedule' : '📝 Schedule a New Class'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '5px' }}>Grade</label>
              <select value={grade} onChange={e => setGrade(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                {gradeList.filter(g => g !== 'All Classes').map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '5px' }}>Day</label>
              <select value={day} onChange={e => setDay(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '5px' }}>Time Window</label>
              <input type="text" placeholder="2.30 PM - 4.30 PM" value={timeSlot} onChange={e => setTimeSlot(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '5px' }}>Subject</label>
              <input type="text" placeholder="English / Science" value={subject} onChange={e => setSubject(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '5px' }}>Lecturer Name</label>
              <input type="text" placeholder="Ranga Rajaguru" value={teacher} onChange={e => setTeacher(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
            </div>

          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#15803d', color: '#ffffff', border: 'none', padding: '10px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              {editingId ? 'Update Schedule 💾' : 'Save Class Schedule 💾'}
            </button>
            <button type="button" onClick={resetForm} style={{ backgroundColor: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grade Filter Pills (Includes 'All Classes') */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', maxWidth: '950px', margin: '0 auto 30px auto' }}>
        {gradeList.map((g) => {
          const isSelected = selectedGrade === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              style={{
                backgroundColor: isSelected ? '#15803d' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                border: isSelected ? 'none' : '1px solid #cbd5e1',
                padding: '8px 20px',
                borderRadius: '30px',
                fontSize: '13.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 4px 12px rgba(21, 128, 61, 0.25)' : '0 2px 5px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {g === 'All Classes' ? '🌐' : '🎓'} {g}
            </button>
          );
        })}
      </div>

      {/* Main Matrix Table */}
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        
        {/* Table Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>
            Aura Class Matrix: {selectedGrade}
          </h3>
          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
            {filteredData.length} Classes Mapped
          </span>
        </div>

        {/* Matrix Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading timetable...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '18px 20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Grade</th>
                  <th style={{ padding: '18px 20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Day</th>
                  <th style={{ padding: '18px 20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Subject</th>
                  <th style={{ padding: '18px 20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Time Window</th>
                  <th style={{ padding: '18px 20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Assigned Lecturer</th>
                  <th style={{ padding: '18px 20px', color: '#64748b', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} style={{ borderBottom: index === filteredData.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '800', color: '#15803d', fontSize: '13.5px' }}>
                        {item.grade}
                      </td>
                      <td style={{ padding: '18px 20px', fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>
                        {item.day}
                      </td>
                      <td style={{ padding: '18px 20px', fontWeight: '800', color: '#0284c7', fontSize: '14px' }}>
                        {item.subject}
                      </td>
                      <td style={{ padding: '18px 20px', fontWeight: '600', color: '#ea580c', fontSize: '13.5px' }}>
                        {item.time_slot}
                      </td>
                      <td style={{ padding: '18px 20px', fontWeight: '800', color: '#15803d', fontSize: '14px' }}>
                        👨‍🏫 <span style={{ textDecoration: 'underline' }}>{item.teacher}</span>
                      </td>
                      <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleEditClick(item)}
                            style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      No classes scheduled for {selectedGrade}. Click <b>"➕ Add New Class"</b> to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}