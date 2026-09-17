import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentMaterials({ user, selectedSubject: initialSubject, setSelectedSubject: setParentSubject }) {
  const [materials, setMaterials] = useState([]);
  const studentGrade = user?.grade || "Grade 8";
  const studentSubjects = user?.subjects 
    ? (Array.isArray(user.subjects) ? user.subjects : String(user.subjects).split(',').map(s => s.trim()).filter(Boolean)) 
    : ["Mathematics", "Science", "English"];

  const [selectedSubject, setSelectedSubject] = useState(initialSubject || studentSubjects[0] || 'Mathematics');
  const [materialLessonFilter, setMaterialLessonFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8082/api/learning-materials')
      .then(res => setMaterials(res.data || []))
      .catch(() => setMaterials([]));
  }, []);

  const parseNum = (str) => parseInt((str || '').replace(/\D/g, '')) || 0;

  const getEmbedUrl = (url) => {
    if (!url) return null;
    let u = url.trim();
    if (u.includes('watch?v=')) return u.replace('watch?v=', 'embed/').split('&')[0];
    if (u.includes('youtu.be/')) return u.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
    return u;
  };

  const getLessonFolder = (title) => {
    const match = (title || '').match(/lesson\s*\d+/i);
    return match ? match[0].toUpperCase().replace('LESSON', 'Lesson ') : 'General Lessons';
  };

  const getCleanTitle = (title, isVideo) => {
    let clean = (title || '').replace(/lesson\s*\d+/gi, '').replace(/video/gi, '').replace(/[-_]/g, '').trim();
    return clean || (isVideo ? 'Video Tutorial & Explanation' : 'Theory Note & Exercises (PDF)');
  };

  const handleSubjectChange = (sub) => {
    setSelectedSubject(sub);
    if (setParentSubject) setParentSubject(sub);
  };

  const subjectMaterials = materials.filter(m => (m.subject || m.subject_name || '').toLowerCase().includes(selectedSubject.toLowerCase()));
  const materialLessons = Array.from(new Set(subjectMaterials.map(m => getLessonFolder(m.title)))).sort((a, b) => parseNum(b) - parseNum(a));

  const groupedMaterials = subjectMaterials
    .filter(m => materialLessonFilter === 'All' || getLessonFolder(m.title) === materialLessonFilter)
    .reduce((acc, item) => {
      const les = getLessonFolder(item.title);
      if (!acc[les]) acc[les] = [];
      acc[les].push(item);
      return acc;
    }, {});

  const sortedMaterialFolderKeys = Object.keys(groupedMaterials).sort((a, b) => parseNum(b) - parseNum(a));

  return (
    <div style={styles.whiteBox}>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#145c2e', fontWeight: 'bold' }}>
            📚 Course Learning Materials - <span style={{ color: '#16a34a' }}>{selectedSubject}</span> ({studentGrade})
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Organized lesson-by-lesson (Newest lesson appears on top)</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {studentSubjects.map(sub => (
            <button key={sub} onClick={() => handleSubjectChange(sub)} style={{ ...styles.filterTab, backgroundColor: selectedSubject === sub ? '#145c2e' : '#f1f5f9', color: selectedSubject === sub ? '#fff' : '#475569' }}>
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.filterBar}>
        <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#145c2e' }}>📘 Filter Lesson Folder:</span>
        <select value={materialLessonFilter} onChange={(e) => setMaterialLessonFilter(e.target.value)} style={styles.selectInput}>
          <option value="All">All Lessons Folder</option>
          {materialLessons.map(les => <option key={les} value={les}>{les}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sortedMaterialFolderKeys.map((lessonTitle) => (
          <div key={lessonTitle} style={styles.folderBox}>
            <div style={styles.folderHeader}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#145c2e', fontWeight: 'bold' }}>📁 {lessonTitle}</h3>
              <span style={styles.countBadge}>{groupedMaterials[lessonTitle].length} Item(s)</span>
            </div>

            <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {groupedMaterials[lessonTitle].map(m => {
                const isVideo = (m.material_type || '').toLowerCase().includes('video') || (m.file_path || '').includes('youtube') || (m.file_path || '').includes('youtu.be');
                const embedUrl = getEmbedUrl(m.file_path);
                const displayTitle = getCleanTitle(m.title, isVideo);

                return (
                  <div key={m.id} style={styles.compactMaterialCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: isVideo ? '#dc2626' : '#2563eb', backgroundColor: isVideo ? '#fef2f2' : '#eff6ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {isVideo ? '🎥 Video Lesson' : '📄 PDF Document'}
                      </span>
                    </div>
                    
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#1e293b', fontWeight: '600', lineHeight: '1.3' }}>
                      {displayTitle}
                    </h4>

                    <div>
                      {isVideo ? (
                        <button onClick={() => setActiveVideo({ url: embedUrl, title: `${lessonTitle} - Video` })} style={{ ...styles.actionBtnCompact, backgroundColor: '#dc2626' }}>
                          ▶️ Watch Video
                        </button>
                      ) : (
                        <a href={`http://localhost:8082/${m.file_path}`} target="_blank" rel="noreferrer" style={{ ...styles.actionBtnCompact, backgroundColor: '#145c2e' }}>
                          👁️ View / Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {sortedMaterialFolderKeys.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>
            No study materials uploaded for <b>{selectedSubject}</b> yet.
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div style={styles.modalOverlay}>
          <div style={styles.videoModal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 'bold' }}>🎥 {activeVideo.title}</h3>
              <button onClick={() => setActiveVideo(null)} style={styles.closeBtn}>✖ Close Player</button>
            </div>
            <div style={{ width: '100%', height: '400px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#000' }}>
              <iframe src={activeVideo.url} title={activeVideo.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  whiteBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '22px' },
  folderBox: { border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  folderHeader: { backgroundColor: '#f0fdf4', padding: '10px 16px', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  countBadge: { fontSize: '11px', color: '#16a34a', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #bbf7d0' },
  compactMaterialCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' },
  actionBtnCompact: { width: '100%', padding: '7px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none', display: 'block', textAlign: 'center', color: '#fff' },
  filterTab: { border: 'none', padding: '7px 16px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' },
  selectInput: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '12.5px', fontWeight: 'bold', backgroundColor: '#fff', color: '#1e293b', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  videoModal: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', width: '720px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  closeBtn: { background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
};