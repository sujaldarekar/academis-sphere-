require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Hod = require('./models/Hod');
const Document = require('./models/Document');
const Notification = require('./models/Notification');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const studentEmail = 'student@student.mes.ac.in';
    const teacherEmail = 'teacher@mes.ac.in';
    const hodEmail = 'hod@mes.ac.in';

    await Promise.all([
      Student.deleteMany({ email: studentEmail }),
      Teacher.deleteMany({ email: teacherEmail }),
      Hod.deleteMany({ email: hodEmail }),
    ]);

    const student = await Student.create({
      name: 'Student One',
      email: studentEmail,
      password: 'test123',
      department: 'CSE',
      studentDetails: {
        batch: '2026',
        enrollmentNumber: 'CSE2026-001',
        cgpa: 8.2,
        placementStatus: 'not-placed',
      },
    });

    const teacher = await Teacher.create({
      name: 'Teacher One',
      email: teacherEmail,
      password: 'test123',
      department: 'CSE',
      teacherDetails: {
        subject: 'DBMS',
        experience: 4,
        qualification: 'M.Tech',
      },
    });

    const hod = await Hod.create({
      name: 'HOD One',
      email: hodEmail,
      password: 'test123',
      department: 'CSE',
      hodDetails: {
        departmentHead: true,
        assignedDepartments: ['CSE'],
      },
    });

    await Document.deleteMany({ studentId: student._id });
    await Document.create({
      studentId: student._id,
      studentName: student.name,
      documentType: 'certificate',
      title: 'CSE Internship Certificate',
      description: 'Internship certificate for Student One',
      fileUrl: 'https://example.com/certificate.pdf',
      fileName: 'internship-certificate.pdf',
      fileSize: 123456,
      mimeType: 'application/pdf',
      status: 'pending',
      cloudinaryId: 'seed-certificate-file',
    });

    await Notification.deleteMany({ recipientId: student._id });
    await Notification.create({
      recipientId: student._id,
      recipientModel: 'Student',
      senderId: teacher._id,
      senderModel: 'Teacher',
      type: 'message',
      title: 'Welcome',
      message: 'Your document is received. Please check updates.',
    });

    console.log('Seed data created: student, teacher, hod, document, notification');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
