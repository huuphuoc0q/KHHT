// Cột điểm thành phần nhỏ (ví dụ: Quiz 1, Quiz 2 trong cột Bài tập)
export interface SubGrade {
  id: string;
  title: string;
  score: number | null; // Điểm số (0-10)
  maxScore: number;     // Thường là 10
}

// Cột điểm thành phần (ví dụ: Giữa kỳ 30%, Chuyên cần 10%, Cuối kỳ 40%)
export interface GradeComponent {
  id: string;
  name: string;
  weight: number;       // Trọng số % (Ví dụ: 30 cho 30%)
  score: number | null; // Điểm của cột này (nếu có subGrades thì tự tính trung bình)
  subGrades: SubGrade[];
}

// Môn học
export interface Course {
  id: string;
  code: string;         // Mã môn (ví dụ: INT1234)
  name: string;         // Tên môn
  credits: number;      // Số tín chỉ
  semester: string;     // Học kỳ (ví dụ: "HK1-2025-2026")
  targetGradeSystem10: number; // Điểm mục tiêu hệ 10 (ví dụ: 8.5)
  gradeComponents: GradeComponent[];
  schedule?: {
    dayOfWeek: number;  // 2 -> 8 (Chủ nhật)
    timeSlot: string;   // "07:00 - 09:30"
    room: string;
  };
  status: 'in-progress' | 'completed' | 'planned';
  color?: string;       // Màu sắc nhận diện môn học
  instructor?: string;  // Giảng viên phụ trách
}

// Bài tập / Deadline
export interface Task {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;      // ISO string hoặc "YYYY-MM-DD"
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

// Cấu hình sinh viên & mục tiêu
export interface UserProfile {
  studentName: string;
  studentId: string;
  major: string;
  university: string;
  targetCumulativeGpa4: number; // Ví dụ 3.6 (Giỏi/Xuất sắc)
  totalRequiredCredits: number; // Ví dụ 135 tín chỉ
  startYear: number;
}

// Thang quy đổi điểm chuẩn
export interface GradeScaleConversion {
  letter: string;      // A, B+, B, C+, C, D+, D, F+, F
  system4: number;     // 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0
  minScore10: number;  // 8.5, 7.8, 7.0, 6.3, 5.5, 4.8, 4.0, 3.0, 0
  rankName: string;    // Xuất sắc, Giỏi, Khá, Trung bình, Yếu, Kém
  badgeColor: string;
}

// Học kỳ
export interface SemesterInfo {
  id: string;
  name: string;
  academicYear: string;
  isCurrent?: boolean;
}

export type ActiveTab = 'dashboard' | 'courses' | 'calculator' | 'schedule' | 'tasks' | 'graduation';
