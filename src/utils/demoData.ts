import { Course, Task, UserProfile, SemesterInfo } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  studentName: 'Nguyễn Hoàng Nam',
  studentId: '22021458',
  major: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
  university: 'Đại học Quốc gia / Bách Khoa',
  targetCumulativeGpa4: 3.65,
  totalRequiredCredits: 135,
  startYear: 2023,
};

export const INITIAL_SEMESTERS: SemesterInfo[] = [
  { id: 'HK1-2024-2025', name: 'Học kỳ 1 (2024 - 2025)', academicYear: '2024-2025' },
  { id: 'HK2-2024-2025', name: 'Học kỳ 2 (2024 - 2025)', academicYear: '2024-2025' },
  { id: 'HK1-2025-2026', name: 'Học kỳ 1 (2025 - 2026)', academicYear: '2025-2026' },
  { id: 'HK2-2025-2026', name: 'Học kỳ 2 (2025 - 2026)', academicYear: '2025-2026', isCurrent: true },
  { id: 'HK1-2026-2027', name: 'Học kỳ 1 (2026 - 2027)', academicYear: '2026-2027' },
];

export const INITIAL_COURSES: Course[] = [
  // --- HỌC KỲ HIỆN TẠI (HK2-2025-2026) - in-progress ---
  {
    id: 'course-web-dev',
    code: 'INT3306',
    name: 'Phát triển Ứng dụng Web Hiện đại',
    credits: 3,
    semester: 'HK2-2025-2026',
    targetGradeSystem10: 9.0,
    status: 'in-progress',
    color: '#3b82f6', // blue
    instructor: 'TS. Trần Văn Hùng',
    schedule: {
      dayOfWeek: 2, // Thứ 2
      timeSlot: '07:30 - 10:00',
      room: 'G2-302',
    },
    gradeComponents: [
      {
        id: 'comp-web-1',
        name: 'Chuyên cần & Tương tác',
        weight: 10,
        score: 10,
        subGrades: [
          { id: 'sg-w1', title: 'Điểm danh buổi 1-5', score: 10, maxScore: 10 },
          { id: 'sg-w2', title: 'Điểm danh buổi 6-10', score: 10, maxScore: 10 },
        ],
      },
      {
        id: 'comp-web-2',
        name: 'Bài tập nhóm & Lab',
        weight: 20,
        score: 8.8,
        subGrades: [
          { id: 'sg-w3', title: 'Lab 1: Tailwind UI', score: 9.0, maxScore: 10 },
          { id: 'sg-w4', title: 'Lab 2: React State', score: 8.5, maxScore: 10 },
          { id: 'sg-w5', title: 'Lab 3: REST API', score: 9.0, maxScore: 10 },
        ],
      },
      {
        id: 'comp-web-3',
        name: 'Thi Giữa kỳ (Trắc nghiệm + Code)',
        weight: 20,
        score: 8.2,
        subGrades: [],
      },
      {
        id: 'comp-web-4',
        name: 'Đồ án & Thi Cuối kỳ',
        weight: 50,
        score: null, // Chưa có - chờ dự toán
        subGrades: [],
      },
    ],
  },
  {
    id: 'course-ai',
    code: 'INT3401',
    name: 'Nhập môn Trí tuệ Nhân tạo',
    credits: 3,
    semester: 'HK2-2025-2026',
    targetGradeSystem10: 8.5,
    status: 'in-progress',
    color: '#8b5cf6', // purple
    instructor: 'PGS.TS. Lê Thị Mai',
    schedule: {
      dayOfWeek: 4, // Thứ 4
      timeSlot: '09:45 - 12:15',
      room: 'E3-401',
    },
    gradeComponents: [
      {
        id: 'comp-ai-1',
        name: 'Chuyên cần',
        weight: 10,
        score: 9.5,
        subGrades: [],
      },
      {
        id: 'comp-ai-2',
        name: 'Bài tập lập trình A* & Minimax',
        weight: 20,
        score: 8.5,
        subGrades: [
          { id: 'sg-ai-1', title: 'BT1: Graph Search', score: 9.0, maxScore: 10 },
          { id: 'sg-ai-2', title: 'BT2: Game Playing', score: 8.0, maxScore: 10 },
        ],
      },
      {
        id: 'comp-ai-3',
        name: 'Thi Giữa kỳ',
        weight: 20,
        score: 7.8,
        subGrades: [],
      },
      {
        id: 'comp-ai-4',
        name: 'Thi Cuối kỳ',
        weight: 50,
        score: null, // Cần dự toán
        subGrades: [],
      },
    ],
  },
  {
    id: 'course-os',
    code: 'INT2208',
    name: 'Nguyên lý Hệ điều hành',
    credits: 3,
    semester: 'HK2-2025-2026',
    targetGradeSystem10: 8.0,
    status: 'in-progress',
    color: '#10b981', // emerald
    instructor: 'TS. Nguyễn Văn Phúc',
    schedule: {
      dayOfWeek: 3, // Thứ 3
      timeSlot: '13:00 - 15:30',
      room: 'G3-205',
    },
    gradeComponents: [
      { id: 'comp-os-1', name: 'Điểm danh & Thảo luận', weight: 10, score: 9.0, subGrades: [] },
      { id: 'comp-os-2', name: 'Thực hành Linux Kernel & Threads', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-os-3', name: 'Kiểm tra Giữa kỳ', weight: 20, score: 7.5, subGrades: [] },
      { id: 'comp-os-4', name: 'Thi Tự luận Cuối kỳ', weight: 50, score: null, subGrades: [] },
    ],
  },
  {
    id: 'course-se',
    code: 'INT3105',
    name: 'Kỹ thuật Phần mềm (Software Eng)',
    credits: 3,
    semester: 'HK2-2025-2026',
    targetGradeSystem10: 8.5,
    status: 'in-progress',
    color: '#f59e0b', // amber
    instructor: 'ThS. Hoàng Đức Minh',
    schedule: {
      dayOfWeek: 5, // Thứ 5
      timeSlot: '07:30 - 10:00',
      room: 'G2-105',
    },
    gradeComponents: [
      { id: 'comp-se-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-se-2', name: 'Báo cáo Sprint Scrum', weight: 30, score: 8.5, subGrades: [] },
      { id: 'comp-se-3', name: 'Kiểm tra Giữa kỳ', weight: 20, score: 8.0, subGrades: [] },
      { id: 'comp-se-4', name: 'Bảo vệ Đồ án Cuối kỳ', weight: 40, score: null, subGrades: [] },
    ],
  },
  {
    id: 'course-security',
    code: 'INT3202',
    name: 'An toàn và Bảo mật Thông tin',
    credits: 3,
    semester: 'HK2-2025-2026',
    targetGradeSystem10: 8.0,
    status: 'in-progress',
    color: '#ef4444', // red
    instructor: 'TS. Vũ Đình Tuấn',
    schedule: {
      dayOfWeek: 6, // Thứ 6
      timeSlot: '09:45 - 12:15',
      room: 'E3-202',
    },
    gradeComponents: [
      { id: 'comp-sec-1', name: 'Chuyên cần', weight: 10, score: 9.0, subGrades: [] },
      { id: 'comp-sec-2', name: 'Lab Mật mã & CTF', weight: 30, score: 8.0, subGrades: [] },
      { id: 'comp-sec-3', name: 'Giữa kỳ', weight: 20, score: 7.0, subGrades: [] },
      { id: 'comp-sec-4', name: 'Thi Cuối kỳ', weight: 40, score: null, subGrades: [] },
    ],
  },

  // --- HỌC KỲ TRƯỚC (HK1-2025-2026) - completed ---
  {
    id: 'course-db',
    code: 'INT2211',
    name: 'Cơ sở Dữ liệu',
    credits: 3,
    semester: 'HK1-2025-2026',
    targetGradeSystem10: 8.5,
    status: 'completed',
    color: '#06b6d4',
    gradeComponents: [
      { id: 'comp-db-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-db-2', name: 'Bài tập SQL & ERD', weight: 20, score: 9.0, subGrades: [] },
      { id: 'comp-db-3', name: 'Thi Giữa kỳ', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-db-4', name: 'Thi Cuối kỳ', weight: 50, score: 8.5, subGrades: [] },
    ],
  },
  {
    id: 'course-oop',
    code: 'INT2204',
    name: 'Lập trình Hướng đối tượng (OOP)',
    credits: 4,
    semester: 'HK1-2025-2026',
    targetGradeSystem10: 9.0,
    status: 'completed',
    color: '#6366f1',
    gradeComponents: [
      { id: 'comp-oop-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-oop-2', name: 'Bài tập lớn Java', weight: 30, score: 9.5, subGrades: [] },
      { id: 'comp-oop-3', name: 'Giữa kỳ', weight: 20, score: 9.0, subGrades: [] },
      { id: 'comp-oop-4', name: 'Cuối kỳ', weight: 40, score: 9.0, subGrades: [] },
    ],
  },
  {
    id: 'course-net',
    code: 'INT2209',
    name: 'Mạng Máy tính',
    credits: 3,
    semester: 'HK1-2025-2026',
    targetGradeSystem10: 8.0,
    status: 'completed',
    color: '#14b8a6',
    gradeComponents: [
      { id: 'comp-net-1', name: 'Chuyên cần', weight: 10, score: 9.0, subGrades: [] },
      { id: 'comp-net-2', name: 'Lab Packet Tracer', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-net-3', name: 'Giữa kỳ', weight: 20, score: 8.0, subGrades: [] },
      { id: 'comp-net-4', name: 'Cuối kỳ', weight: 50, score: 7.8, subGrades: [] },
    ],
  },
  {
    id: 'course-prob',
    code: 'MAT1042',
    name: 'Xác suất Thống kê',
    credits: 3,
    semester: 'HK1-2025-2026',
    targetGradeSystem10: 8.0,
    status: 'completed',
    color: '#f97316',
    gradeComponents: [
      { id: 'comp-prob-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-prob-2', name: 'Bài tập', weight: 20, score: 8.0, subGrades: [] },
      { id: 'comp-prob-3', name: 'Giữa kỳ', weight: 20, score: 7.5, subGrades: [] },
      { id: 'comp-prob-4', name: 'Cuối kỳ', weight: 50, score: 8.0, subGrades: [] },
    ],
  },

  // --- HỌC KỲ 2 (2024 - 2025) - completed ---
  {
    id: 'course-dsa',
    code: 'INT2210',
    name: 'Cấu trúc Dữ liệu & Giải thuật',
    credits: 4,
    semester: 'HK2-2024-2025',
    targetGradeSystem10: 9.0,
    status: 'completed',
    color: '#8b5cf6',
    gradeComponents: [
      { id: 'comp-dsa-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-dsa-2', name: 'Bài tập LeetCode', weight: 20, score: 9.5, subGrades: [] },
      { id: 'comp-dsa-3', name: 'Giữa kỳ', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-dsa-4', name: 'Cuối kỳ', weight: 50, score: 9.0, subGrades: [] },
    ],
  },
  {
    id: 'course-arch',
    code: 'INT2207',
    name: 'Kiến trúc Máy tính & Hợp ngữ',
    credits: 3,
    semester: 'HK2-2024-2025',
    targetGradeSystem10: 8.0,
    status: 'completed',
    color: '#64748b',
    gradeComponents: [
      { id: 'comp-arch-1', name: 'Chuyên cần', weight: 10, score: 9.0, subGrades: [] },
      { id: 'comp-arch-2', name: 'Lab MIPS', weight: 20, score: 8.0, subGrades: [] },
      { id: 'comp-arch-3', name: 'Giữa kỳ', weight: 20, score: 7.5, subGrades: [] },
      { id: 'comp-arch-4', name: 'Cuối kỳ', weight: 50, score: 8.0, subGrades: [] },
    ],
  },
  {
    id: 'course-calc2',
    code: 'MAT1041',
    name: 'Giải tích 2',
    credits: 3,
    semester: 'HK2-2024-2025',
    targetGradeSystem10: 8.5,
    status: 'completed',
    color: '#0284c7',
    gradeComponents: [
      { id: 'comp-c2-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-c2-2', name: 'Bài tập', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-c2-3', name: 'Giữa kỳ', weight: 20, score: 8.0, subGrades: [] },
      { id: 'comp-c2-4', name: 'Cuối kỳ', weight: 50, score: 8.5, subGrades: [] },
    ],
  },

  // --- HỌC KỲ 1 (2024 - 2025) - completed ---
  {
    id: 'course-calc1',
    code: 'MAT1040',
    name: 'Giải tích 1',
    credits: 3,
    semester: 'HK1-2024-2025',
    targetGradeSystem10: 8.5,
    status: 'completed',
    color: '#0284c7',
    gradeComponents: [
      { id: 'comp-c1-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-c1-2', name: 'Bài tập', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-c1-3', name: 'Giữa kỳ', weight: 20, score: 8.5, subGrades: [] },
      { id: 'comp-c1-4', name: 'Cuối kỳ', weight: 50, score: 8.5, subGrades: [] },
    ],
  },
  {
    id: 'course-algebra',
    code: 'MAT1043',
    name: 'Đại số Tuyến tính',
    credits: 3,
    semester: 'HK1-2024-2025',
    targetGradeSystem10: 8.5,
    status: 'completed',
    color: '#7c3aed',
    gradeComponents: [
      { id: 'comp-alg-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-alg-2', name: 'Bài tập', weight: 20, score: 9.0, subGrades: [] },
      { id: 'comp-alg-3', name: 'Giữa kỳ', weight: 20, score: 8.0, subGrades: [] },
      { id: 'comp-alg-4', name: 'Cuối kỳ', weight: 50, score: 8.5, subGrades: [] },
    ],
  },
  {
    id: 'course-intro-it',
    code: 'INT1004',
    name: 'Tin học Cơ sở & Lập trình C',
    credits: 4,
    semester: 'HK1-2024-2025',
    targetGradeSystem10: 9.0,
    status: 'completed',
    color: '#059669',
    gradeComponents: [
      { id: 'comp-c-1', name: 'Chuyên cần', weight: 10, score: 10, subGrades: [] },
      { id: 'comp-c-2', name: 'Thực hành', weight: 20, score: 9.5, subGrades: [] },
      { id: 'comp-c-3', name: 'Giữa kỳ', weight: 20, score: 9.0, subGrades: [] },
      { id: 'comp-c-4', name: 'Cuối kỳ', weight: 50, score: 9.2, subGrades: [] },
    ],
  },

  // --- HỌC KỲ DỰ KIẾN (HK1-2026-2027) - planned ---
  {
    id: 'course-ml',
    code: 'INT3405',
    name: 'Học máy nâng cao (Machine Learning)',
    credits: 3,
    semester: 'HK1-2026-2027',
    targetGradeSystem10: 8.5,
    status: 'planned',
    color: '#8b5cf6',
    gradeComponents: [
      { id: 'comp-ml-1', name: 'Chuyên cần', weight: 10, score: null, subGrades: [] },
      { id: 'comp-ml-2', name: 'Bài tập Kaggle', weight: 30, score: null, subGrades: [] },
      { id: 'comp-ml-3', name: 'Thi Cuối kỳ', weight: 60, score: null, subGrades: [] },
    ],
  },
  {
    id: 'course-cloud',
    code: 'INT3315',
    name: 'Điện toán Đám mây & DevOps',
    credits: 3,
    semester: 'HK1-2026-2027',
    targetGradeSystem10: 9.0,
    status: 'planned',
    color: '#0284c7',
    gradeComponents: [
      { id: 'comp-cloud-1', name: 'Chuyên cần', weight: 10, score: null, subGrades: [] },
      { id: 'comp-cloud-2', name: 'Lab AWS / Docker', weight: 40, score: null, subGrades: [] },
      { id: 'comp-cloud-3', name: 'Cuối kỳ', weight: 50, score: null, subGrades: [] },
    ],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    courseId: 'course-web-dev',
    title: 'Hoàn thiện Frontend Đồ án Web với React + Tailwind',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    status: 'in-progress',
    priority: 'high',
    description: 'Tích hợp Zustand store, hoàn thiện Responsive UI cho mobile và deploy lên Vercel',
  },
  {
    id: 'task-2',
    courseId: 'course-ai',
    title: 'Viết thuật toán Minimax và Alpha-Beta Pruning cho Cờ Caro',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'todo',
    priority: 'high',
    description: 'Nộp file mã nguồn .py kèm slide giải thích hàm đánh giá heuristic',
  },
  {
    id: 'task-3',
    courseId: 'course-os',
    title: 'Thực hành mô phỏng Lập lịch CPU (Round Robin & SJF)',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'todo',
    priority: 'medium',
    description: 'Đo lường Waiting Time và Turnaround Time trung bình',
  },
  {
    id: 'task-4',
    courseId: 'course-se',
    title: 'Nộp Báo cáo Sprint 3 & Sơ đồ Sequence Diagram',
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'todo',
    priority: 'medium',
    description: 'Cập nhật Jira board và tài liệu SRS',
  },
  {
    id: 'task-5',
    courseId: 'course-security',
    title: 'Giải bài tập CTF Web Security (SQL Injection & XSS)',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'todo',
    priority: 'low',
    description: 'Chụp ảnh màn hình flag và viết write-up ngắn',
  },
  {
    id: 'task-6',
    courseId: 'course-web-dev',
    title: 'Làm Quiz 1: Khái niệm Component Lifecycle & Hooks',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'done',
    priority: 'medium',
    description: 'Đã hoàn thành đạt 10/10',
  },
];
