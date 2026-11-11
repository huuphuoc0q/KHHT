import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Flag, 
  Filter, 
  Check, 
  BookOpen 
} from 'lucide-react';
import { Task } from '../types';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { TaskModal } from './TaskModal';
import confetti from 'canvas-confetti';

export const TasksView: React.FC = () => {
  const { tasks, courses, toggleTaskStatus, deleteTask } = useUniPlanStore();

  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'done'>('pending');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Status tab
    if (statusTab === 'pending' && t.status === 'done') return false;
    if (statusTab === 'done' && t.status !== 'done') return false;

    // Course
    if (courseFilter !== 'ALL' && t.courseId !== courseFilter) return false;

    // Priority
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

    return true;
  });

  const handleToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== 'done') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      });
    }
    toggleTaskStatus(taskId);
  };

  const getRelativeDueInfo = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Hôm nay!', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30 animate-pulse', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Ngày mai', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', isOverdue: false };
    } else {
      return { text: `Còn ${diffDays} ngày`, color: 'text-slate-400 bg-slate-800 border-slate-700', isOverdue: false };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Action */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quản Lý Deadlines &amp; Bài Tập</h1>
            <p className="text-xs text-slate-400">
              Theo dõi hạn chót các bài tập lớn, bài quiz, lab và lịch thi của từng môn
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTask(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Deadline</span>
        </button>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setStatusTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusTab === 'pending'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cần làm ({tasks.filter(t => t.status !== 'done').length})
          </button>
          <button
            onClick={() => setStatusTab('done')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusTab === 'done'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đã xong ({tasks.filter(t => t.status === 'done').length})
          </button>
          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusTab === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
        </div>

        {/* Course & Priority Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-slate-800 text-xs font-medium text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả môn học</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 text-xs font-medium text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Mọi mức ưu tiên</option>
            <option value="high">Ưu tiên Cao (Gấp)</option>
            <option value="medium">Ưu tiên Trung bình</option>
            <option value="low">Ưu tiên Thấp</option>
          </select>

        </div>

      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            const linkedCourse = courses.find((c) => c.id === task.courseId);
            const relative = getRelativeDueInfo(task.dueDate);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Left: Checkbox + Content */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center transition cursor-pointer flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-slate-600 hover:border-purple-400 text-transparent hover:text-purple-400'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {linkedCourse && (
                        <span 
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                          style={{ 
                            color: linkedCourse.color || '#3b82f6',
                            borderColor: `${linkedCourse.color || '#3b82f6'}40`,
                            backgroundColor: `${linkedCourse.color || '#3b82f6'}15`,
                          }}
                        >
                          {linkedCourse.code} • {linkedCourse.name}
                        </span>
                      )}

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {task.priority === 'high' ? 'Gấp' : task.priority === 'medium' ? 'Vừa' : 'Thấp'}
                      </span>
                    </div>

                    <h3 className={`text-sm font-semibold mt-1 text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border font-medium ${relative.color}`}>
                        <Calendar className="w-3 h-3" />
                        <span>Hạn: {task.dueDate}</span>
                        <span>({relative.text})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingTaskId(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Chỉnh sửa deadline"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa deadline này?')) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Xóa deadline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Không có deadline nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {statusTab === 'pending'
              ? 'Tuyệt vời! Bạn đã hoàn thành hết các bài tập.'
              : 'Chưa có bài tập nào trong danh sách lọc.'}
          </p>
          <button
            onClick={() => setIsAddingTask(true)}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Deadline Mới</span>
          </button>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {(isAddingTask || editingTaskId) && (
        <TaskModal
          taskId={editingTaskId}
          onClose={() => {
            setIsAddingTask(false);
            setEditingTaskId(null);
          }}
        />
      )}

    </div>
  );
};
