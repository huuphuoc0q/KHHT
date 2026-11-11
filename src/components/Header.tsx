import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calculator, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  Sparkles, 
  Database, 
  User, 
  Plus
} from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { ActiveTab } from '../types';

interface HeaderProps {
  onOpenProfile: () => void;
  onOpenDataModal: () => void;
  onOpenAiAdvisor: () => void;
  onOpenAddCourse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  onOpenDataModal,
  onOpenAiAdvisor,
  onOpenAddCourse,
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    semesters, 
    activeSemesterId, 
    setActiveSemesterId, 
    userProfile 
  } = useUniPlanStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { id: 'dashboard', label: 'Tổng quan', shortLabel: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'courses', label: 'Môn học & Điểm', shortLabel: 'Môn học', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'calculator', label: 'Dự toán Điểm thi', shortLabel: 'Dự toán', icon: <Calculator className="w-4 h-4" /> },
    { id: 'schedule', label: 'Thời khóa biểu', shortLabel: 'Lịch học', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'tasks', label: 'Deadline & Bài tập', shortLabel: 'Deadline', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'graduation', label: 'Lộ trình Tốt nghiệp', shortLabel: 'Tốt nghiệp', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  UniPlan
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI & Tín chỉ
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Quản lý học tập &amp; Dự toán điểm thi đại học
              </p>
            </div>
          </div>

          {/* Center: Semester Selector */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <span className="text-xs text-slate-400 pl-2 pr-1 font-medium">Học kỳ:</span>
            <select
              value={activeSemesterId}
              onChange={(e) => setActiveSemesterId(e.target.value)}
              className="bg-slate-900 text-xs font-medium text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">🌟 Tất cả học kỳ (Toàn khóa)</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isCurrent ? `📌 ${s.name} (Hiện tại)` : s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2">
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAiAdvisor}
              className="relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 text-xs font-semibold text-white shadow-md shadow-purple-500/20 border border-purple-400/30 transition-all cursor-pointer group"
              title="Mở Cố vấn học tập AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AI Cố vấn</span>
            </button>

            {/* Quick Add Course Button */}
            <button
              onClick={onOpenAddCourse}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
              title="Thêm môn học mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm môn</span>
            </button>

            {/* Data Management (Backup / Restore / Reset) */}
            <button
              onClick={onOpenDataModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
              title="Sao lưu, Phục hồi & Dữ liệu mẫu"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Student Profile */}
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
              title="Hồ sơ & Mục tiêu sinh viên"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                {userProfile.studentName ? userProfile.studentName.charAt(0) : 'U'}
              </div>
              <span className="text-xs font-medium hidden md:inline truncate max-w-[120px]">
                {userProfile.studentName || 'Sinh viên'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Semester Selector */}
        <div className="md:hidden py-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Học kỳ hiển thị:</span>
          <select
            value={activeSemesterId}
            onChange={(e) => setActiveSemesterId(e.target.value)}
            className="bg-slate-800 text-xs font-medium text-slate-200 px-2 py-1 rounded border border-slate-700 focus:outline-none"
          >
            <option value="ALL">🌟 Toàn khóa</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.isCurrent ? `📌 ${s.name}` : s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
