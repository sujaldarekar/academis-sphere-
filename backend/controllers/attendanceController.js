const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    console.log('[ATTENDANCE] Mark attendance called');
    console.log('[ATTENDANCE] Request body:', JSON.stringify(req.body, null, 2));
    
    // Handle both direct array and nested attendanceData
    const attendanceData = Array.isArray(req.body) ? req.body : req.body.attendanceData;
    const teacherId = req.user.userId;

    console.log('[ATTENDANCE] Teacher ID:', teacherId);
    console.log('[ATTENDANCE] Attendance data:', JSON.stringify(attendanceData, null, 2));

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      console.log('[ATTENDANCE] ERROR: No attendance data provided');
      return res.status(400).json({ error: 'No attendance data provided' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const results = [];
    for (const record of attendanceData) {
      const { studentId, rollNumber, status, remarks, classType, date } = record;

      // Validate required fields
      if (!studentId || !rollNumber || !status) {
        results.push({ studentId, error: 'Missing required fields' });
        continue;
      }

      // Get student details
      const student = await Student.findById(studentId);
      if (!student) {
        results.push({ studentId, error: 'Student not found' });
        continue;
      }

      try {
        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(attendanceDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(attendanceDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          student: studentId,
          date: {
            $gte: startOfDay,
            $lt: endOfDay
          },
          teacher: teacherId,
        });

        let attendance;
        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status;
          existingAttendance.remarks = remarks || '';
          existingAttendance.classType = classType || 'lecture';
          attendance = await existingAttendance.save();
        } else {
          // Create new attendance record
          attendance = new Attendance({
            student: studentId,
            rollNumber,
            studentName: student.name,
            teacher: teacherId,
            subject: teacher.subject,
            department: student.department,
            date: attendanceDate,
            status,
            remarks: remarks || '',
            classType: classType || 'lecture',
          });
          attendance = await attendance.save();
        }

        results.push({
          studentId,
          rollNumber,
          status: 'success',
          message: 'Attendance marked',
          attendanceId: attendance._id,
        });
        
        console.log('[ATTENDANCE] Marked:', {
          studentId,
          rollNumber,
          status,
          date: attendance.date,
          attendanceId: attendance._id
        });
      } catch (error) {
        console.error('[ATTENDANCE] Error marking for student:', studentId, error);
        results.push({ studentId, error: error.message });
      }
    }

    console.log('[ATTENDANCE] Completed marking. Success:', results.filter(r => r.status === 'success').length);
    res.json({
      message: 'Attendance marked successfully',
      results,
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

// Get student's attendance
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.userId;
    console.log('[ATTENDANCE] Fetching attendance for student:', studentId);

    const attendance = await Attendance.find({ student: studentId })
      .populate('teacher', 'name subject')
      .sort({ date: -1 })
      .limit(100);

    console.log('[ATTENDANCE] Found records:', attendance.length);
    if (attendance.length > 0) {
      console.log('[ATTENDANCE] Sample record:', {
        date: attendance[0].date,
        status: attendance[0].status,
        student: attendance[0].student,
      });
    }

    if (!attendance || attendance.length === 0) {
      return res.json({ 
        data: [], 
        statistics: {
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          attendancePercentage: 0,
        },
        message: 'No attendance records' 
      });
    }

    // Calculate attendance statistics
    const totalClasses = attendance.length;
    const presentCount = attendance.filter((a) => a.status === 'present').length;
    const absentCount = attendance.filter((a) => a.status === 'absent').length;
    const lateCount = attendance.filter((a) => a.status === 'late').length;
    const excusedCount = attendance.filter((a) => a.status === 'excused').length;

    // Calculate percentage based on present vs total (present + absent + late + excused)
    const attendancePercentage =
      totalClasses > 0 ? Math.round(((presentCount + lateCount + excusedCount) / totalClasses) * 100) : 0;

    res.json({
      data: attendance,
      statistics: {
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Get teacher's students attendance for a date
const getTeacherStudentsAttendance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { date } = req.query;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get all students in the same department
    const students = await Student.find({
      department: teacher.department,
    }).select('_id name rollNumber email department');

    // Get attendance for the date
    const attendanceDate = date ? new Date(date) : new Date();
    const attendanceRecords = await Attendance.find({
      teacher: teacherId,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
      },
    });

    // Map students with their attendance
    const studentsWithAttendance = students.map((student) => {
      const attendance = attendanceRecords.find(
        (a) => a.student.toString() === student._id.toString()
      );
      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.department,
        status: attendance?.status || 'absent',
        remarks: attendance?.remarks || '',
        classType: attendance?.classType || 'lecture',
        attendanceId: attendance?._id,
      };
    });

    res.json({
      data: studentsWithAttendance,
      date: attendanceDate.toISOString().split('T')[0],
      subject: teacher.subject,
    });
  } catch (error) {
    console.error('Error fetching students attendance:', error);
    res.status(500).json({ error: 'Failed to fetch students attendance' });
  }
};

// Get attendance summary for a student
const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { month } = req.query;

    let query = { student: studentId };

    if (month) {
      const startDate = new Date(month);
      const endDate = new Date(month);
      endDate.setMonth(endDate.getMonth() + 1);
      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Group by subject
    const bySubject = {};
    attendance.forEach((record) => {
      if (!bySubject[record.subject]) {
        bySubject[record.subject] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      bySubject[record.subject].total += 1;
      bySubject[record.subject][record.status] += 1;
    });

    // Calculate percentages
    const summary = {};
    Object.keys(bySubject).forEach((subject) => {
      const data = bySubject[subject];
      summary[subject] = {
        ...data,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      };
    });

    res.json({
      summary,
      totalRecords: attendance.length,
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getTeacherStudentsAttendance,
  getAttendanceSummary,
};
