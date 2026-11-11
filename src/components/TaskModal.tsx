import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Flag, BookOpen, AlignLeft } from 'lucide-react';
import { Task } from '../types';
import { useUniPlanStore } from '../store/useUniPlanStore';

interface TaskModalProps {
  taskId?: string | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { tasks, courses, addTask, updateTask } = useUniPlanStore();
  const existing = taskId ? tasks.find((t) => t.id === taskId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [courseId, setCourseId] = useState(existing?.courseId || courses[0]?.id || '');
  const [dueDate, setDueDate] = useState(
    existing?.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<Task['priority']>(existing?.priority || 'medium');
  const [status, setStatus] = useState<Task['status']>(existing?.status || 'todo');
  const [description, setDescription] = useState(existing?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    if (existing) {
      updateTask(existing.id, {
        title: title.trim(),
        courseId,
        dueDate,
        priority,
        status,
        description: description.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        courseId,
        dueDate,
        priority,
        status,
        description: description.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {existing ? 'Sửa Deadline & Bài Tập' : 'Thêm Deadline Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Ghi nhớ hạn chót nộp bài tập, đồ án hoặc lịch kiểm tra
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tiêu đề bài tập / nhiệm vụ <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nộp Báo cáo Bài tập lớn Web (React + Express)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Linked Course */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Môn học liên kết</span>
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due date, Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hạn chót (Due)</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Mức ưu tiên</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="high">Cao (Gấp)</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="todo">Cần làm</option>
                <option value="in-progress">Đang làm</option>
                <option value="done">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Ghi chú / Chi tiết yêu cầu</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú link nộp bài, yêu cầu định dạng file .zip / .pdf..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              {existing ? 'Cập Nhật' : 'Tạo Deadline'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
