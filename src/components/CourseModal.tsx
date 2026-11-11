import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, Clock, MapPin, User, Target, Palette } from 'lucide-react';
import { Course } from '../types';
import { useUniPlanStore } from '../store/useUniPlanStore';

interface CourseModalProps {
  courseId?: string | null; // null => creating new
  initialSemester?: string;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#64748b', // slate
];

export const CourseModal: React.FC<CourseModalProps> = ({
  courseId,
  initialSemester,
  onClose,
}) => {
  const { courses, semesters, activeSemesterId, addCourse, updateCourse } = useUniPlanStore();
  const existing = courseId ? courses.find((c) => c.id === courseId) : null;

  const defaultSemester = initialSemester || (activeSemesterId !== 'ALL' ? activeSemesterId : semesters[0]?.id || 'HK1-2025-2026');

  const [code, setCode] = useState(existing?.code || '');
  const [name, setName] = useState(existing?.name || '');
  const [credits, setCredits] = useState<number>(existing?.credits || 3);
  const [semester, setSemester] = useState(existing?.semester || defaultSemester);
  const [targetGrade, setTargetGrade] = useState<number>(existing?.targetGradeSystem10 || 8.5);
  const [status, setStatus] = useState<Course['status']>(existing?.status || 'in-progress');
  const [color, setColor] = useState(existing?.color || PRESET_COLORS[0]);
  const [instructor, setInstructor] = useState(existing?.instructor || '');

  // Schedule
  const [dayOfWeek, setDayOfWeek] = useState<number>(existing?.schedule?.dayOfWeek || 2);
  const [timeSlot, setTimeSlot] = useState(existing?.schedule?.timeSlot || '07:30 - 10:00');
  const [room, setRoom] = useState(existing?.schedule?.room || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const courseData: Omit<Course, 'id'> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      credits: Number(credits) || 1,
      semester,
      targetGradeSystem10: Number(targetGrade) || 8.5,
      status,
      color,
      instructor: instructor.trim() || undefined,
      schedule: room.trim() || timeSlot.trim() ? {
        dayOfWeek: Number(dayOfWeek),
        timeSlot: timeSlot.trim(),
        room: room.trim(),
      } : undefined,
      gradeComponents: existing?.gradeComponents || [
        { id: `comp-1-${Date.now()}`, name: 'Chuyên cần', weight: 10, score: null, subGrades: [] },
        { id: `comp-2-${Date.now()}`, name: 'Kiểm tra Giữa kỳ', weight: 20, score: null, subGrades: [] },
        { id: `comp-3-${Date.now()}`, name: 'Bài tập lớn / Thực hành', weight: 20, score: null, subGrades: [] },
        { id: `comp-4-${Date.now()}`, name: 'Thi Cuối kỳ', weight: 50, score: null, subGrades: [] },
      ],
    };

    if (existing) {
      updateCourse(existing.id, courseData);
    } else {
      addCourse(courseData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {existing ? 'Chỉnh Sửa Môn Học' : 'Thêm Môn Học Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập mã môn, số tín chỉ, mục tiêu điểm và lịch học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mã môn học <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: INT3306"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tên môn học <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Phát triển Ứng dụng Web Hiện đại"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Credits, Semester, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Số tín chỉ
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Học kỳ
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="in-progress">Đang học</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="planned">Dự kiến</option>
              </select>
            </div>
          </div>

          {/* Row 3: Target Grade & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Điểm mục tiêu hệ 10</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {targetGrade >= 8.5 ? 'Mục tiêu: Điểm A (Giỏi/Xuất sắc)' : targetGrade >= 7.0 ? 'Mục tiêu: Điểm B (Khá)' : 'Mục tiêu: Điểm C/D'}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Giảng viên phụ trách</span>
              </label>
              <input
                type="text"
                placeholder="VD: TS. Nguyễn Văn A"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Màu nhận diện môn</span>
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-transform cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Schedule section */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch học hàng tuần (Thời khóa biểu)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Thứ trong tuần</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value={2}>Thứ Hai</option>
                  <option value={3}>Thứ Ba</option>
                  <option value={4}>Thứ Tư</option>
                  <option value={5}>Thứ Năm</option>
                  <option value={6}>Thứ Sáu</option>
                  <option value={7}>Thứ Bảy</option>
                  <option value={8}>Chủ Nhật</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Ca học / Khung giờ</span>
                </label>
                <input
                  type="text"
                  placeholder="07:30 - 10:00"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Phòng học</span>
                </label>
                <input
                  type="text"
                  placeholder="G2-302"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              {existing ? 'Lưu Thay Đổi' : 'Tạo Môn Học'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
