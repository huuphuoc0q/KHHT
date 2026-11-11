import React, { useState } from 'react';
import { X, User, School, BookOpen, Target, Award, Check } from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { userProfile, updateUserProfile } = useUniPlanStore();

  const [studentName, setStudentName] = useState(userProfile.studentName || '');
  const [studentId, setStudentId] = useState(userProfile.studentId || '');
  const [major, setMajor] = useState(userProfile.major || '');
  const [university, setUniversity] = useState(userProfile.university || '');
  const [targetGpa, setTargetGpa] = useState<number>(userProfile.targetCumulativeGpa4 || 3.6);
  const [totalCredits, setTotalCredits] = useState<number>(userProfile.totalRequiredCredits || 135);
  const [startYear, setStartYear] = useState<number>(userProfile.startYear || 2023);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      studentName: studentName.trim(),
      studentId: studentId.trim(),
      major: major.trim(),
      university: university.trim(),
      targetCumulativeGpa4: Number(targetGpa) || 3.6,
      totalRequiredCredits: Number(totalCredits) || 135,
      startYear: Number(startYear) || 2023,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hồ Sơ Sinh Viên &amp; Mục Tiêu</h2>
              <p className="text-xs text-slate-400">
                Tùy chỉnh thông tin ngành học, trường và mục tiêu điểm tốt nghiệp
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mã Số Sinh Viên (MSSV)
              </label>
              <input
                type="text"
                placeholder="22021458"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <span>Trường Đại Học</span>
              </label>
              <input
                type="text"
                placeholder="ĐHQG / Bách Khoa / Kinh Tế..."
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Ngành / Chuyên Ngành</span>
              </label>
              <input
                type="text"
                placeholder="Khoa học máy tính..."
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>GPA Mục Tiêu (Hệ 4)</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="2.0"
                max="4.0"
                value={targetGpa}
                onChange={(e) => setTargetGpa(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {targetGpa >= 3.6 ? 'Xuất Sắc (≥3.60)' : targetGpa >= 3.2 ? 'Giỏi (≥3.20)' : 'Khá (≥2.50)'}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tổng TC Tốt Nghiệp
              </label>
              <input
                type="number"
                min="50"
                max="200"
                value={totalCredits}
                onChange={(e) => setTotalCredits(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Thường 120 - 150 TC
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Năm Nhập Học (K)
              </label>
              <input
                type="number"
                min="2015"
                max="2035"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              Lưu Thông Tin
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
