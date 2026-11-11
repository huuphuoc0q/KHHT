import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Calculator, 
  Edit3, 
  Copy, 
  Trash2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Course } from '../types';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { calculateCourseGrade, getComponentScore, convertScoreToGrade } from '../utils/gradeCalculations';
import { GradeDetailModal } from './GradeDetailModal';
import { CourseModal } from './CourseModal';

interface CoursesViewProps {
  onOpenCalculatorForCourse: (courseId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ onOpenCalculatorForCourse }) => {
  const { 
    courses, 
    semesters, 
    activeSemesterId, 
    setActiveSemesterId, 
    deleteCourse, 
    duplicateCourse 
  } = useUniPlanStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [editingGradeCourseId, setEditingGradeCourseId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    // 1. Semester filter
    if (activeSemesterId !== 'ALL' && c.semester !== activeSemesterId) {
      return false;
    }
    // 2. Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.instructor && c.instructor.toLowerCase().includes(q));
    }
    return true;
  });

  const totalCredits = filteredCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Filter & Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên môn học, mã môn (vd: INT3306), giảng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Right: Semester & Status selectors + Add button */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 text-xs font-medium text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="in-progress">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="planned">Dự kiến</option>
          </select>

          {/* Add Course button */}
          <button
            onClick={() => setIsAddingCourse(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Môn Học</span>
          </button>
        </div>

      </div>

      {/* Summary stats strip */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Hiển thị <strong className="text-white">{filteredCourses.length}</strong> môn học • Tổng cộng <strong className="text-cyan-300">{totalCredits}</strong> tín chỉ
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Đang học ({courses.filter(c => c.status === 'in-progress').length})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đã hoàn thành ({courses.filter(c => c.status === 'completed').length})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Dự kiến ({courses.filter(c => c.status === 'planned').length})</span>
          </span>
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredCourses.map((course) => {
            const { 
              totalWeight, 
              accumulatedWeightedScore, 
              finalScore10, 
              currentAverage10, 
              isFullyGraded,
              conversion 
            } = calculateCourseGrade(course);

            const isWeight100 = totalWeight === 100;
            const displayScore = finalScore10 ?? currentAverage10;

            return (
              <div
                key={course.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-lg overflow-hidden flex flex-col justify-between transition-all"
              >
                
                {/* Course Header */}
                <div className="p-5 border-b border-slate-800/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div 
                        className="w-3 h-12 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: course.color || '#3b82f6' }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {course.code}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                            {course.credits} Tín chỉ
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            course.status === 'in-progress'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : course.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {course.status === 'in-progress' ? 'Đang học' : course.status === 'completed' ? 'Đã học' : 'Dự kiến'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white mt-1.5 truncate" title={course.name}>
                          {course.name}
                        </h3>

                        {course.instructor && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            GV: {course.instructor}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Grade Badge */}
                    <div className="text-right flex-shrink-0">
                      {displayScore !== null ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-extrabold text-white font-mono">
                              {displayScore.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400">/ 10</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${conversion.badgeColor}`}>
                              {conversion.letter}
                            </span>
                            <span className="text-xs font-semibold text-slate-300">
                              ({conversion.system4.toFixed(1)})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Chưa có điểm</span>
                      )}
                    </div>
                  </div>

                  {/* Schedule row if available */}
                  {course.schedule && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center space-x-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{course.schedule.dayOfWeek === 8 ? 'Chủ Nhật' : `Thứ ${course.schedule.dayOfWeek}`}: {course.schedule.timeSlot}</span>
                      </span>
                      {course.schedule.room && (
                        <span>• Phòng: <strong className="text-slate-200">{course.schedule.room}</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {/* Grade Components Preview & Visual Weight Bar */}
                <div className="p-5 bg-slate-950/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Cơ cấu trọng số điểm:</span>
                    <span className={`font-medium ${isWeight100 ? 'text-emerald-400' : 'text-amber-400 flex items-center space-x-1'}`}>
                      {!isWeight100 && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      <span>Tổng: {totalWeight}%</span>
                    </span>
                  </div>

                  {/* Weight Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                    {course.gradeComponents.map((comp, idx) => {
                      const score = getComponentScore(comp);
                      const hasScore = score !== null;
                      const colors = [
                        'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'
                      ];
                      const compColor = colors[idx % colors.length];

                      return (
                        <div
                          key={comp.id}
                          className={`${compColor} h-full relative group transition-all`}
                          style={{ 
                            width: `${Math.min(100, comp.weight)}%`,
                            opacity: hasScore ? 1 : 0.45 
                          }}
                          title={`${comp.name}: ${comp.weight}% (${hasScore ? `Điểm: ${score}` : 'Chưa có điểm'})`}
                        />
                      );
                    })}
                  </div>

                  {/* Components Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {course.gradeComponents.map((comp) => {
                      const score = getComponentScore(comp);
                      return (
                        <div 
                          key={comp.id}
                          className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] flex items-center space-x-1.5"
                        >
                          <span className="text-slate-300 font-medium">{comp.name}</span>
                          <span className="text-slate-400">({comp.weight}%)</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {score !== null ? score.toFixed(1) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {/* Grade Detail Button */}
                    <button
                      onClick={() => setEditingGradeCourseId(course.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Cột điểm &amp; SubGrades</span>
                    </button>

                    {/* Final Exam Solver button */}
                    <button
                      onClick={() => onOpenCalculatorForCourse(course.id)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-medium transition cursor-pointer"
                      title="Tính điểm thi cuối kỳ cần đạt"
                    >
                      <Calculator className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden sm:inline">Dự toán thi</span>
                    </button>
                  </div>

                  {/* Edit, Copy, Delete icons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingCourseId(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Sửa thông tin môn"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicateCourse(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                      title="Nhân bản môn này"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa môn "${course.name}"?`)) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      title="Xóa môn học"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Không tìm thấy môn học nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Không có môn học phù hợp với bộ lọc hiện tại. Bấm nút "Thêm Môn Học" để tạo mới.
          </p>
          <button
            onClick={() => setIsAddingCourse(true)}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Môn Học Ngay</span>
          </button>
        </div>
      )}

      {/* Grade Detail Modal */}
      {editingGradeCourseId && (
        <GradeDetailModal
          courseId={editingGradeCourseId}
          onClose={() => setEditingGradeCourseId(null)}
          onOpenCalculatorForCourse={onOpenCalculatorForCourse}
        />
      )}

      {/* Add / Edit Course Modal */}
      {(isAddingCourse || editingCourseId) && (
        <CourseModal
          courseId={editingCourseId}
          onClose={() => {
            setIsAddingCourse(false);
            setEditingCourseId(null);
          }}
        />
      )}

    </div>
  );
};
