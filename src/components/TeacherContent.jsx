import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🟢 SMART LESSON NAME NORMALIZER
const normalizeLessonTitle = (rawTitle) => {
  if (!rawTitle) return 'General Course Resources';
  const match = String(rawTitle).match(/(lesson\s*\d+|chapter\s*\d+)/i);
  if (match) {
    const num = match[1].match(/\d+/)[0];
    return `Lesson ${num.padStart(2, '0')}`;
  }
  const clean = rawTitle.replace(/\s*(video|pdf|handout|doc|link|recording)\s*/gi, '').trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'General Course Resources';
};

export default function TeacherContent({ userName, teachingSubject, materials, fetchData, timetable, preSelectedGrade, setPreSelectedGrade, teacherGrades }) {
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('PDF'); 
  const [formFilePath, setFormFilePath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formGrade, setFormGrade] = useState(teacherGrades[0] || 'Grade 8');
  const [tableFilter, setTableFilter] = useState('All');

  useEffect(() => {
    if (preSelectedGrade) {
      setFormGrade(preSelectedGrade);
      setTableFilter(preSelectedGrade); 
      setPreSelectedGrade(null);
    } else if (teacherGrades.length > 0 && !formGrade) {
      setFormGrade(teacherGrades[0]);
    }
  }, [preSelectedGrade, teacherGrades, formGrade, setPreSelectedGrade]);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getCorrectAccessUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    return `http://localhost:8082/${filePath}`;
  };

  const handlePublishLesson = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', formTitle);
    formData.append('material_type', formType);
    formData.append('grade', formGrade);
    formData.append('subject', teachingSubject);
    formData.append('teacher_name', userName);

    if ((formType === 'PDF' || formType === 'Past Paper' || formType === 'Direct Video') && selectedFile) {
        formData.append('file', selectedFile); 
    } else {
        formData.append('file_path', formFilePath);
    }

    axios.post('http://localhost:8082/api/add-material', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
      if (res.data.status === "Success") {
        alert(`✅ ${formType} Published Successfully!`);
        fetchData(); 
        setFormTitle(''); 
        setFormFilePath(''); 
        setSelectedFile(null);
      }
    }).catch(err => console.log(err));
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      axios.delete(`http://localhost:8082/api/delete-material/${id}`)
        .then(res => {
          if (res.data.status === "Success") {
            alert("🗑️ Material removed successfully!");
            fetchData();
          }
        }).catch(err => console.log(err));
    }
  };

  const filteredMaterials = materials.filter(m => {
    const subjectMatch = m.subject === teachingSubject;
    const gradeMatch = tableFilter === 'All' ? true : m.grade === tableFilter;
    return subjectMatch && gradeMatch;
  });

  const pastPapers = filteredMaterials
    .filter(m => m.material_type === 'Past Paper')
    .sort((a, b) => b.id - a.id);

  // 🟢 DYNAMIC NESTED GROUPING WITH SMART NORMALIZATION
  const courseworkItems = filteredMaterials.filter(m => m.material_type !== 'Past Paper');
  const lessonGroups = {};

  courseworkItems.forEach(item => {
    const normalizedTitle = normalizeLessonTitle(item.title);
    const groupKey = normalizedTitle.toUpperCase().replace(/\s+/g, '');

    if (!lessonGroups[groupKey]) {
      lessonGroups[groupKey] = {
        key: groupKey,
        title: normalizedTitle,
        items: [],
        latestId: 0
      };
    }
    lessonGroups[groupKey].items.push(item);
    if (item.id > lessonGroups[groupKey].latestId) {
      lessonGroups[groupKey].latestId = item.id;
    }
  });

  const sortedLessonGroups = Object.values(lessonGroups).sort((a, b) => {
    if (a.key.includes("GENERAL")) return 1;
    if (b.key.includes("GENERAL")) return -1;
    
    const numA = parseInt(a.key.replace(/[^\d]/g, ''), 10) || 0;
    const numB = parseInt(b.key.replace(/[^\d]/g, ''), 10) || 0;
    return numB - numA; 
  });

  const getDynamicBadgeStyle = (type) => {
    switch (type) {
      case 'PDF': return { bg: '#eff6ff', color: '#2563eb', text: '📚 PDF DOC' };
      case 'YouTube': return { bg: '#fff5f5', color: '#e53e3e', text: '🎬 YOUTUBE' };
      case 'Direct Video': return { bg: '#faf5ff', color: '#8b5cf6', text: '🎥 MP4' };
      case 'Zoom Link': return { bg: '#f0fdf4', color: '#16a34a', text: '🎥 LIVE' };
      default: return { bg: '#f8fafc', color: '#475569', text: '📼 RECORD' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontFamily: 'sans-serif' }}>
      
      {/* Upload Portal Form */}
      <div>
        <h2 style={{ color: '#1e293b', margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>Distributed Content Gateway ({teachingSubject})</h2>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', borderTop: '5px solid #145c2e', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
          <form onSubmit={handlePublishLesson} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <input 
              type="text" 
              placeholder="Material Title (e.g., Lesson 01 - Core Handout)" 
              value={formTitle} 
              onChange={e => setFormTitle(e.target.value)} 
              required 
              style={styles.fullInput} 
            />
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <select value={formGrade} onChange={e => setFormGrade(e.target.value)} style={styles.fullInput}>
                {teacherGrades.length > 0 ? (
                  teacherGrades.map(g => <option key={g} value={g}>{g}</option>)
                ) : (
                  ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => <option key={g} value={g}>{g}</option>)
                )}
              </select>

              <select value={formType} onChange={e => { setFormType(e.target.value); setSelectedFile(null); setFormFilePath(''); }} style={styles.fullInput}>
                <option value="PDF">📚 PDF Handout Documents</option>
                <option value="Past Paper">🎯 Official Past Exam Papers</option>
                <option value="Direct Video">📁 Direct Video Upload (MP4)</option>
                <option value="YouTube">🎬 YouTube Video Lesson</option>
                <option value="Zoom Link">🎥 Live Zoom Meeting Link</option>
                <option value="Recording">📼 Recorded Video / Drive Link</option>
              </select>
            </div>

            {formType === 'PDF' || formType === 'Past Paper' || formType === 'Direct Video' ? (
              <input 
                type="file" 
                accept={formType === 'Direct Video' ? "video/mp4,video/*" : ".pdf"} 
                onChange={e => setSelectedFile(e.target.files[0])} 
                required 
                style={styles.fileInput} 
              />
            ) : (
              <input 
                type="text" 
                placeholder={
                  formType === 'YouTube' ? "Enter YouTube Video URL..." :
                  formType === 'Zoom Link' ? "Enter Live Zoom Meeting Link..." :
                  "Enter Google Drive or Cloud Recording Link..."
                } 
                value={formFilePath} 
                onChange={e => setFormFilePath(e.target.value)} 
                required 
                style={styles.fullInput} 
              />
            )}
            
            <button type="submit" style={styles.publishBtn}>Publish Material Content 🚀</button>
          </form>
        </div>
      </div>

      {/* INSTANCE FILTER Scope Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: 0, color: '#145c2e', fontSize: '15px', fontWeight: 'bold' }}>Active Dashboard Filter Scope</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Filter by Instance Grade:</span>
          <select value={tableFilter} onChange={e => setTableFilter(e.target.value)} style={styles.filterDropdown}>
            <option value="All">🌐 All Assigned Grades</option>
            {teacherGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* SECTION 1: UNIFIED LESSON MATRIX SPACE */}
      <div>
        <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
          📚 Academic Coursework & Video Lesson Modules
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {sortedLessonGroups.map((group, gIdx) => (
            <div key={gIdx} style={styles.chapterCard}>
              <div style={styles.chapterHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={styles.chapterDot}></span>
                  <span style={styles.chapterTitleText}>{group.title} Matrix Space</span>
                </div>
                <span style={styles.itemCountBadge}>{group.items.length} Active Resources</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px' }}>
                {group.items.map((item, iIdx) => {
                  const ytId = getYoutubeId(item.file_path);
                  const meta = getDynamicBadgeStyle(item.material_type);
                  return (
                    <div key={item.id || iIdx} style={styles.resourceRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                        
                        {item.material_type === 'YouTube' && ytId ? (
                          <div style={styles.videoWrapper}>
                            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} title="YT" frameBorder="0" allowFullScreen></iframe>
                          </div>
                        ) : (
                          <div style={{ ...styles.typeCardBlock, backgroundColor: meta.bg, color: meta.color }}>
                            {meta.text}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={styles.resourceTitle}>{item.title}</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={styles.miniGrade}>{item.grade}</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: meta.color }}>{item.material_type}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a href={getCorrectAccessUrl(item.file_path)} target="_blank" rel="noreferrer" style={styles.actionLaunchBtn}>Launch Resource ➔</a>
                        <button onClick={() => handleDeleteMaterial(item.id)} style={styles.actionDeleteBtn}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {sortedLessonGroups.length === 0 && (
            <div style={styles.cleanEmptyPanel}>No active coursework chapters generated yet.</div>
          )}
        </div>
      </div>

      {/* SECTION 2: ARCHIVED PAST PAPERS SECTION */}
      <div>
        <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
          🎯 Official Past Examination Papers Archive
        </h3>
        <div style={styles.pastPapersWrapper}>
          {pastPapers.map((paper, pIdx) => (
            <div key={paper.id || pIdx} style={{ ...styles.resourceRow, borderLeft: '4px solid #dc2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{ ...styles.typeCardBlock, backgroundColor: '#fef2f2', color: '#dc2626' }}>📝 EXAM</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ ...styles.resourceTitle, color: '#b91c1c' }}>{paper.title}</span>
                  <span style={styles.miniGrade}>{paper.grade}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a href={getCorrectAccessUrl(paper.file_path)} target="_blank" rel="noreferrer" style={{ ...styles.actionLaunchBtn, color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>View Paper ➔</a>
                <button onClick={() => handleDeleteMaterial(paper.id)} style={styles.actionDeleteBtn}>Delete</button>
              </div>
            </div>
          ))}

          {pastPapers.length === 0 && (
            <div style={styles.cleanEmptyPanel}>No archived past examination papers deployed yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}

const styles = {
  fullInput: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontSize: '13.5px' },
  fileInput: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontSize: '13.5px' },
  publishBtn: { padding: '14px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%', marginTop: '5px', boxShadow: '0 4px 12px rgba(20,92,46,0.15)' },
  filterDropdown: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #145c2e', backgroundColor: 'white', fontSize: '13px', fontWeight: 'bold', color: '#145c2e', outline: 'none', cursor: 'pointer' },
  chapterCard: { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' },
  chapterHeader: { backgroundColor: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chapterDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#145c2e', display: 'inline-block' },
  chapterTitleText: { fontSize: '15px', fontWeight: 'bold', color: '#1e293b' },
  itemCountBadge: { fontSize: '11px', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', color: '#475569' },
  resourceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 15px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 5px rgba(0,0,0,0.005)' },
  typeCardBlock: { width: '110px', height: '54px', borderRadius: '8px', fontSize: '10.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.5px' },
  videoWrapper: { borderRadius: '8px', overflow: 'hidden', width: '110px', height: '54px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  resourceTitle: { fontSize: '14.5px', fontWeight: '600', color: '#1e293b' },
  miniGrade: { fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  actionLaunchBtn: { color: '#145c2e', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', border: '1px solid #bbf7d0' },
  actionDeleteBtn: { backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  pastPapersWrapper: { display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  cleanEmptyPanel: { padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }
};