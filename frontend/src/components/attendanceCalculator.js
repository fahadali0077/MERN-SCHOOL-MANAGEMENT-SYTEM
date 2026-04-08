// FIX F-9: Returns a number (parseFloat), not a string
export const calculateSubjectAttendancePercentage = (presentCount, totalSessions) => {
    if (totalSessions === 0 || presentCount === 0) {
        return 0;
    }
    const percentage = (presentCount / totalSessions) * 100;
    return parseFloat(percentage.toFixed(2));
};

export const groupAttendanceBySubject = (subjectAttendance) => {
    const attendanceBySubject = {};

    subjectAttendance.forEach((attendance) => {
        // FIX F-9: guard against null/undefined subName
        if (!attendance.subName || !attendance.subName.subName) return;

        const subName = attendance.subName.subName;
        const sessions = attendance.subName.sessions;
        const subId = attendance.subName._id;

        if (!attendanceBySubject[subName]) {
            attendanceBySubject[subName] = {
                present: 0,
                absent: 0,
                sessions: sessions,
                allData: [],
                subId: subId,
            };
        }
        if (attendance.status === 'Present') {
            attendanceBySubject[subName].present++;
        } else if (attendance.status === 'Absent') {
            attendanceBySubject[subName].absent++;
        }
        attendanceBySubject[subName].allData.push({
            date: attendance.date,
            status: attendance.status,
        });
    });

    return attendanceBySubject;
};

export const calculateOverallAttendancePercentage = (subjectAttendance) => {
    let totalSessionsSum = 0;
    let presentCountSum = 0;

    // FIX F-9: Use Set for O(1) uniqueness checks instead of array.includes()
    const seenSubIds = new Set();

    subjectAttendance.forEach((attendance) => {
        // Guard against null subName
        if (!attendance.subName) return;

        const subId = attendance.subName._id;
        if (!seenSubIds.has(subId)) {
            seenSubIds.add(subId);
            totalSessionsSum += parseInt(attendance.subName.sessions, 10);
        }
        if (attendance.status === 'Present') presentCountSum++;
    });

    if (totalSessionsSum === 0 || presentCountSum === 0) {
        return 0;
    }

    return (presentCountSum / totalSessionsSum) * 100;
};
