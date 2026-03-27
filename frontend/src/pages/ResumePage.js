import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { resumeService } from '../services/api';
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';

export const ResumePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    education: '',
    experience: '',
    projects: '',
  });

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const response = await resumeService.getMyResume();
      const sections = response.data?.sections || {};

      setForm({
        fullName: sections.personalInfo?.fullName || '',
        email: sections.personalInfo?.email || '',
        phone: sections.personalInfo?.phone || '',
        location: sections.personalInfo?.location || '',
        summary: sections.summary?.content || '',
        skills: Array.isArray(sections.skills?.content) ? sections.skills.content.join(', ') : '',
        education: Array.isArray(sections.education)
          ? sections.education
              .map((item) => [item.degree, item.institution, item.cgpa ? `CGPA:${item.cgpa}` : ''].filter(Boolean).join(' | '))
              .join('\n')
          : '',
        experience: Array.isArray(sections.experience)
          ? sections.experience
              .map((item) => [item.jobTitle, item.company, item.description].filter(Boolean).join(' | '))
              .join('\n')
          : '',
        projects: Array.isArray(sections.projects)
          ? sections.projects
              .map((item) => [item.title, item.technologies?.join(', '), item.description].filter(Boolean).join(' | '))
              .join('\n')
          : '',
      });
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsedSkills = form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const parsedEducation = form.education
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [degree = '', institution = '', third = ''] = line.split('|').map((part) => part.trim());
          const cgpaText = third.toLowerCase().startsWith('cgpa:') ? third.slice(5).trim() : third;
          const cgpaValue = cgpaText ? Number(cgpaText) : undefined;
          return {
            degree,
            institution,
            ...(Number.isFinite(cgpaValue) ? { cgpa: cgpaValue } : {}),
          };
        });

      const parsedExperience = form.experience
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [jobTitle = '', company = '', description = ''] = line.split('|').map((part) => part.trim());
          return { jobTitle, company, description };
        });

      const parsedProjects = form.projects
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', technologiesRaw = '', description = ''] = line.split('|').map((part) => part.trim());
          return {
            title,
            technologies: technologiesRaw
              .split(',')
              .map((tech) => tech.trim())
              .filter(Boolean),
            description,
          };
        });

      await resumeService.updateSection('personalInfo', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        location: form.location,
      });

      await resumeService.updateSection('summary', {
        content: form.summary,
      });

      await resumeService.updateSection('skills', {
        content: parsedSkills,
      });

      await resumeService.updateSection('education', parsedEducation);
      await resumeService.updateSection('experience', parsedExperience);
      await resumeService.updateSection('projects', parsedProjects);

      await loadResume();
      alert('Resume saved successfully');
    } catch (error) {
      alert('Failed to save resume details');
    } finally {
      setSaving(false);
    }
  };

  const downloadResumePdf = (resumeData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 52;

    const sections = resumeData?.sections || {};
    const personalInfo = sections.personalInfo || {};
    const summary = sections.summary?.content || '';
    const skills = sections.skills?.content || [];
    const education = sections.education || [];
    const experience = sections.experience || [];
    const projects = sections.projects || [];

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(personalInfo.fullName || 'Student Resume', 12, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const contact = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join('  •  ');
    doc.text(contact || 'Resume', 12, 25);

    const ensureSpace = (requiredHeight = 14) => {
      if (y + requiredHeight > pageHeight - 14) {
        doc.addPage();
        y = 18;
      }
    };

    const addSectionHeading = (heading) => {
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(heading, 12, y);
      y += 8;
    };

    const addParagraph = (text) => {
      const lines = doc.splitTextToSize(text || '-', pageWidth - 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);
      lines.forEach((line) => {
        ensureSpace(6);
        doc.text(line, 12, y);
        y += 6;
      });
      y += 2;
    };

    addSectionHeading('Professional Summary');
    addParagraph(summary || 'No summary provided.');

    addSectionHeading('Skills');
    addParagraph(skills.length ? skills.join(', ') : 'No skills added.');

    addSectionHeading('Education');
    if (education.length) {
      education.forEach((item) => {
        const line = [item.degree, item.institution, item.cgpa ? `CGPA: ${item.cgpa}` : ''].filter(Boolean).join(' | ');
        addParagraph(`• ${line}`);
      });
    } else {
      addParagraph('No education details added.');
    }

    addSectionHeading('Experience');
    if (experience.length) {
      experience.forEach((item) => {
        const line = [item.jobTitle, item.company, item.description].filter(Boolean).join(' | ');
        addParagraph(`• ${line}`);
      });
    } else {
      addParagraph('No experience details added.');
    }

    addSectionHeading('Projects');
    if (projects.length) {
      projects.forEach((item) => {
        const line = [item.title, item.technologies?.join(', '), item.description].filter(Boolean).join(' | ');
        addParagraph(`• ${line}`);
      });
    } else {
      addParagraph('No project details added.');
    }

    doc.save('resume.pdf');
  };

  const handleGenerateAndDownload = async () => {
    try {
      setGenerating(true);
      const response = await resumeService.autoGenerate();
      downloadResumePdf(response.data);
      await loadResume();
      alert('Resume generated and downloaded');
    } catch (error) {
      alert('Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <p style={{ padding: '16px' }}>Loading resume...</p>;

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.headerCard}>
          <div>
            <h1 style={styles.title}>Resume</h1>
            <p style={styles.subtitle}>Uses your uploaded certificates from Documents section directly.</p>
          </div>
          <div style={styles.actionRow}>
            <button style={styles.primaryBtn} onClick={handleGenerateAndDownload} disabled={generating}>
              {generating ? 'Generating...' : 'Generate & Download'}
            </button>
          </div>
        </div>

        <Card title="Resume Details">
          <div style={styles.formGrid}>
            <div style={styles.sectionHeading}>Personal Information</div>
            <input
              style={styles.input}
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <input
              style={styles.input}
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />

            <div style={styles.sectionHeading}>Professional Summary</div>
            <textarea
              style={styles.textarea}
              placeholder="Professional Summary"
              value={form.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
            />

            <div style={styles.sectionHeading}>Skills</div>
            <textarea
              style={styles.textareaSmall}
              placeholder="Example: Java, React, Node.js, MongoDB"
              value={form.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
            />

            <div style={styles.sectionHeading}>Education</div>
            <textarea
              style={styles.textarea}
              placeholder="Degree / Institution / CGPA"
              value={form.education}
              onChange={(e) => handleChange('education', e.target.value)}
            />

            <div style={styles.sectionHeading}>Experience</div>
            <textarea
              style={styles.textarea}
              placeholder=" Company / Description"
              value={form.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
            />

            <div style={styles.sectionHeading}>Projects</div>
            <textarea
              style={styles.textarea}
              placeholder="  Company / Description "
              value={form.projects}
              onChange={(e) => handleChange('projects', e.target.value)}
            />
          </div>

          <div style={styles.saveRow}>
            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f9ff',
  },
  main: {
    flex: 1,
    padding: '28px',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #e8f1ff 0%, #f7fbff 100%)',
    border: '1px solid #d7e6ff',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    color: '#14365a',
    fontSize: '28px',
  },
  subtitle: {
    margin: '6px 0 0 0',
    color: '#4a6582',
    fontSize: '14px',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '10px 14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '10px 14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  sectionHeading: {
    gridColumn: '1 / -1',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1f3c63',
    marginTop: '8px',
    marginBottom: '-2px',
  },
  input: {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #d6deea',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    minHeight: '95px',
    gridColumn: '1 / -1',
    padding: '11px 12px',
    border: '1px solid #d6deea',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: '#fff',
  },
  textareaSmall: {
    width: '100%',
    minHeight: '70px',
    gridColumn: '1 / -1',
    padding: '11px 12px',
    border: '1px solid #d6deea',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: '#fff',
  },
  saveRow: {
    marginTop: '14px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: '#fff',
    padding: '10px 16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
