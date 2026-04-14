import { apiSlice } from './apiSlice';

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation<any, any>({
      query: (data) => ({ url: '/auth/register', method: 'POST', body: data }),
    }),
    logout: builder.mutation<any, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query<any, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (data) => ({ url: '/auth/forgot-password', method: 'POST', body: data }),
    }),
    resetPassword: builder.mutation<any, { token: string; password: string }>({
      query: (data) => ({ url: '/auth/reset-password', method: 'POST', body: data }),
    }),
    changePassword: builder.mutation<any, { currentPassword: string; newPassword: string }>({
      query: (data) => ({ url: '/auth/change-password', method: 'PATCH', body: data }),
    }),
  }),
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const studentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<any, { page?: number; limit?: number; search?: string; classId?: string }>({
      query: (params) => ({ url: '/students', params }),
      providesTags: ['Students'],
    }),
    getStudent: builder.query<any, string>({
      query: (id) => `/students/${id}`,
      providesTags: (result, error, id) => [{ type: 'Students', id }],
    }),
    createStudent: builder.mutation<any, any>({
      query: (data) => ({ url: '/students', method: 'POST', body: data }),
      invalidatesTags: ['Students'],
    }),
    updateStudent: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/students/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Students', id }, 'Students'],
    }),
    deleteStudent: builder.mutation<any, string>({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Students'],
    }),
    getStudentStats: builder.query<any, void>({
      query: () => '/students/stats',
      providesTags: ['Students'],
    }),
  }),
});

// ─── TEACHERS ────────────────────────────────────────────────────────────────
export const teachersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query<any, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({ url: '/teachers', params }),
      providesTags: ['Teachers'],
    }),
    getTeacher: builder.query<any, string>({
      query: (id) => `/teachers/${id}`,
    }),
    createTeacher: builder.mutation<any, any>({
      query: (data) => ({ url: '/teachers', method: 'POST', body: data }),
      invalidatesTags: ['Teachers'],
    }),
    updateTeacher: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/teachers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Teachers'],
    }),
  }),
});

// ─── CLASSES ─────────────────────────────────────────────────────────────────
export const classesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<any, void>({
      query: () => '/classes',
      providesTags: ['Classes'],
    }),
    getClass: builder.query<any, string>({
      query: (id) => `/classes/${id}`,
    }),
    createClass: builder.mutation<any, any>({
      query: (data) => ({ url: '/classes', method: 'POST', body: data }),
      invalidatesTags: ['Classes'],
    }),
    getSubjects: builder.query<any, void>({
      query: () => '/classes/subjects/all',
      providesTags: ['Subjects'],
    }),
    createSubject: builder.mutation<any, any>({
      query: (data) => ({ url: '/classes/subjects', method: 'POST', body: data }),
      invalidatesTags: ['Subjects'],
    }),
  }),
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    markAttendance: builder.mutation<any, any>({
      query: (data) => ({ url: '/attendance', method: 'POST', body: data }),
      invalidatesTags: ['Attendance'],
    }),
    getAttendance: builder.query<any, { classId: string; date: string; period?: number }>({
      query: (params) => ({ url: '/attendance', params }),
      providesTags: ['Attendance'],
    }),
    generateQR: builder.mutation<any, any>({
      query: (data) => ({ url: '/attendance/qr/generate', method: 'POST', body: data }),
    }),
    scanQR: builder.mutation<any, { token: string; studentId: string }>({
      query: (data) => ({ url: '/attendance/qr/scan', method: 'POST', body: data }),
    }),
    getStudentAttendance: builder.query<any, { studentId: string; month?: number; year?: number }>({
      query: ({ studentId, ...params }) => ({ url: `/attendance/student/${studentId}`, params }),
      providesTags: ['Attendance'],
    }),
  }),
});

// ─── MARKS ───────────────────────────────────────────────────────────────────
export const marksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query<any, any>({
      query: (params) => ({ url: '/marks/exams', params }),
      providesTags: ['Exams'],
    }),
    getExam: builder.query<any, string>({
      query: (id) => `/marks/exams/${id}`,
    }),
    createExam: builder.mutation<any, any>({
      query: (data) => ({ url: '/marks/exams', method: 'POST', body: data }),
      invalidatesTags: ['Exams'],
    }),
    enterMarks: builder.mutation<any, any>({
      query: (data) => ({ url: '/marks', method: 'POST', body: data }),
      invalidatesTags: ['Marks'],
    }),
    getExamMarks: builder.query<any, { examId: string; classId: string; subjectId?: string }>({
      query: ({ examId, classId, ...params }) => ({ url: `/marks/exam/${examId}/class/${classId}`, params }),
      providesTags: ['Marks'],
    }),
    getReportCard: builder.query<any, { studentId: string; examId: string }>({
      query: ({ studentId, examId }) => `/marks/report-card/${studentId}/${examId}`,
    }),
    publishResults: builder.mutation<any, string>({
      query: (examId) => ({ url: `/marks/exams/${examId}/publish`, method: 'POST' }),
      invalidatesTags: ['Marks', 'Exams'],
    }),
  }),
});

// ─── FEES ─────────────────────────────────────────────────────────────────────
export const feesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeeStructures: builder.query<any, void>({
      query: () => '/fees/structures',
      providesTags: ['Fees'],
    }),
    createFeeStructure: builder.mutation<any, any>({
      query: (data) => ({ url: '/fees/structures', method: 'POST', body: data }),
      invalidatesTags: ['Fees'],
    }),
    getInvoices: builder.query<any, any>({
      query: (params) => ({ url: '/fees', params }),
      providesTags: ['Invoices'],
    }),
    getStudentFees: builder.query<any, string>({
      query: (studentId) => `/fees/student/${studentId}`,
      providesTags: ['Invoices'],
    }),
    generateInvoices: builder.mutation<any, any>({
      query: (data) => ({ url: '/fees/generate', method: 'POST', body: data }),
      invalidatesTags: ['Invoices'],
    }),
    recordPayment: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/fees/${id}/payment`, method: 'POST', body: data }),
      invalidatesTags: ['Invoices'],
    }),
    sendReminders: builder.mutation<any, void>({
      query: () => ({ url: '/fees/reminders', method: 'POST' }),
    }),
  }),
});

// ─── NOTICES ──────────────────────────────────────────────────────────────────
export const noticesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotices: builder.query<any, { page?: number; type?: string }>({
      query: (params) => ({ url: '/notices', params }),
      providesTags: ['Notices'],
    }),
    createNotice: builder.mutation<any, any>({
      query: (data) => ({ url: '/notices', method: 'POST', body: data }),
      invalidatesTags: ['Notices'],
    }),
    updateNotice: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/notices/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Notices'],
    }),
    deleteNotice: builder.mutation<any, string>({
      query: (id) => ({ url: `/notices/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notices'],
    }),
  }),
});

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<any, void>({
      query: () => '/dashboard/admin',
      providesTags: ['Dashboard'],
    }),
    getTeacherDashboard: builder.query<any, void>({
      query: () => '/dashboard/teacher',
    }),
    getStudentDashboard: builder.query<any, void>({
      query: () => '/dashboard/student',
    }),
  }),
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, { page?: number; unreadOnly?: boolean }>({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<any, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

// Export all hooks
export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery, useForgotPasswordMutation, useResetPasswordMutation, useChangePasswordMutation } = authApi;
export const { useGetStudentsQuery, useGetStudentQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation, useGetStudentStatsQuery } = studentsApi;
export const { useGetTeachersQuery, useGetTeacherQuery, useCreateTeacherMutation, useUpdateTeacherMutation } = teachersApi;
export const { useGetClassesQuery, useGetClassQuery, useCreateClassMutation, useGetSubjectsQuery, useCreateSubjectMutation } = classesApi;
export const { useMarkAttendanceMutation, useGetAttendanceQuery, useGenerateQRMutation, useScanQRMutation, useGetStudentAttendanceQuery } = attendanceApi;
export const { useGetExamsQuery, useGetExamQuery, useCreateExamMutation, useEnterMarksMutation, useGetExamMarksQuery, useGetReportCardQuery, usePublishResultsMutation } = marksApi;
export const { useGetFeeStructuresQuery, useCreateFeeStructureMutation, useGetInvoicesQuery, useGetStudentFeesQuery, useGenerateInvoicesMutation, useRecordPaymentMutation, useSendRemindersMutation } = feesApi;
export const { useGetNoticesQuery, useCreateNoticeMutation, useUpdateNoticeMutation, useDeleteNoticeMutation } = noticesApi;
export const { useGetAdminDashboardQuery, useGetTeacherDashboardQuery, useGetStudentDashboardQuery } = dashboardApi;
export const { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } = notificationsApi;
