import React from 'react';
import { 
  Award, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Target, 
  Calendar, 
  ArrowRight, 
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { calculateGPA, calculateCourseGrade, convertScoreToGrade } from '../utils/gradeCalculations';
import confetti from 'canvas-confetti';

export const DashboardView: React.FC = () => {
  const { 
    courses, 
    tasks, 
    semesters, 
    activeSemesterId, 
    setActiveSemesterId, 
    setActiveTab, 
    userProfile,
    toggleTaskStatus
  } = useUniPlanStore();

  // 1. Tính toán GPA tích lũy toàn khóa
  const overallStats = calculateGPA(courses);

  // 2. Tính toán GPA cho học kỳ đang chọn (hoặc hiện tại)
  const filteredCourses = activeSemesterId === 'ALL'
    ? courses
    : courses.filter(c => c.semester === activeSemesterId);
  const semesterStats = calculateGPA(filteredCourses);

  // 3. Tiến độ tín chỉ
  const earnedCredits = overallStats.totalEarnedCredits;
  const inProgressCredits = courses
    .filter(c => c.status === 'in-progress')
    .reduce((sum, c) => sum + c.credits, 0);
  const requiredCredits = userProfile.totalRequiredCredits || 135;
  const progressPercent = Math.min(100, Math.round((earnedCredits / requiredCredits) * 100));

  // 4. Deadlines & Tasks
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const urgentTasks = pendingTasks
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // 5. Chuẩn bị dữ liệu biểu đồ xu hướng GPA qua các học kỳ
  const gpaTrendData = semesters.map(sem => {
    const semCourses = courses.filter(c => c.semester === sem.id);
    const { gpa4, gpa10, totalCredits } = calculateGPA(semCourses);
    return {
      semesterId: sem.id,
      name: sem.name.replace('Học kỳ ', 'HK').replace(' (', ' ').replace(')', ''),
      gpa4: totalCredits > 0 ? gpa4 : null,
      gpa10: totalCredits > 0 ? gpa10 : null,
      credits: totalCredits,
      isCurrent: sem.isCurrent,
    };
  }).filter(item => item.gpa4 !== null || item.isCurrent);

  // 6. Phân bổ điểm chữ (Grade distribution)
  const gradeCountMap: Record<string, number> = {
    'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D+': 0, 'D': 0, 'F': 0
  };
  courses.forEach(c => {
    const grade = calculateCourseGrade(c);
    const score = grade.finalScore10 ?? grade.currentAverage10;
    if (score !== null) {
      const conv = convertScoreToGrade(score);
      gradeCountMap[conv.letter] = (gradeCountMap[conv.letter] || 0) + 1;
    }
  });

  const gradeDistributionData = Object.entries(gradeCountMap)
    .filter(([_, count]) => count > 0)
    .map(([letter, count]) => ({
      letter,
      count,
      color: letter.startsWith('A') 
        ? '#10b981' 
        : letter.startsWith('B') 
        ? '#3b82f6' 
        : letter.startsWith('C') 
        ? '#f59e0b' 
        : letter.startsWith('D') 
        ? '#f97316' 
        : '#ef4444',
    }));

  // 7. Lịch học hôm nay
  const currentDayOfWeek = new Date().getDay() === 0 ? 8 : new Date().getDay() + 1; // 2->8
  const todayClasses = courses.filter(c => 
    c.status === 'in-progress' && 
    c.schedule && 
    c.schedule.dayOfWeek === currentDayOfWeek
  );

  const handleTaskCheck = (taskId: string) => {
    toggleTaskStatus(taskId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Cố vấn Tiến độ Tín chỉ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Chào {userProfile.studentName || 'Sinh viên'}! 🎓
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              {userProfile.major ? `${userProfile.major} • ` : ''}
              {userProfile.university || 'Đại học'} • MSSV: <span className="font-mono text-cyan-300">{userProfile.studentId || 'Chưa cập nhật'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('calculator')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Target className="w-4 h-4 text-cyan-200" />
              <span>Dự toán Điểm thi Cuối kỳ</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-sm font-medium transition cursor-pointer"
            >
              <span>Xem Bảng điểm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: GPA Toàn Khóa */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">GPA Tích Lũy Toàn Khóa</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {overallStats.gpa4.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Hệ 10: <strong className="text-slate-200">{overallStats.gpa10.toFixed(2)}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              overallStats.gpa4 >= 3.6 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : overallStats.gpa4 >= 3.2 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {overallStats.honor.title.split(' ')[0]}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Mục tiêu: {userProfile.targetCumulativeGpa4.toFixed(2)}</span>
            <span className={overallStats.gpa4 >= userProfile.targetCumulativeGpa4 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
              {overallStats.gpa4 >= userProfile.targetCumulativeGpa4 ? '✓ Đạt mục tiêu' : `Còn ${(userProfile.targetCumulativeGpa4 - overallStats.gpa4).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Card 2: GPA Học kỳ hiện chọn */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider truncate max-w-[170px]" title="GPA Học kỳ hiển thị">
              {activeSemesterId === 'ALL' ? 'GPA Toàn Bộ Môn' : 'GPA Học Kỳ Này'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {semesterStats.gpa4.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Hệ 10: <strong className="text-slate-200">{semesterStats.gpa10.toFixed(2)}</strong>
            </span>
            <span className="text-slate-400 font-medium">
              {filteredCourses.length} môn học
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tín chỉ kỳ này:</span>
            <span className="font-semibold text-cyan-300">{semesterStats.totalCredits} TC</span>
          </div>
        </div>

        {/* Card 3: Tiến độ Tín chỉ */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiến Độ Tín Chỉ</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {earnedCredits}
            </span>
            <span className="text-sm font-medium text-slate-400">/ {requiredCredits} TC</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Hoàn thành {progressPercent}%</span>
            <span>Đang học: <strong className="text-amber-400">+{inProgressCredits} TC</strong></span>
          </div>
        </div>

        {/* Card 4: Nhiệm vụ & Deadlines */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Nhiệm Vụ &amp; Deadline</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {pendingTasks.length}
            </span>
            <span className="text-sm font-medium text-slate-400">việc cần làm</span>
          </div>
          <div className="mt-2 flex items-center space-x-3 text-xs">
            <span className="text-emerald-400 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>{completedTasks.length} đã xong</span>
            </span>
            {pendingTasks.some(t => t.priority === 'high') && (
              <span className="text-rose-400 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Có việc gấp</span>
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>Xem danh sách deadline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Charts & Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: GPA Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Xu Hướng Biến Động GPA Qua Các Học Kỳ</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đánh giá tiến độ giữ vững GPA hệ 4.0 và đường chuẩn mục tiêu tốt nghiệp
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span>GPA Hệ 4</span>
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-400">
                  <span className="w-2.5 h-0.5 bg-emerald-400 border border-dashed border-emerald-400 inline-block" />
                  <span>Mục tiêu ({userProfile.targetCumulativeGpa4})</span>
                </span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-64 sm:h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 4.0]} 
                    ticks={[1.0, 2.0, 2.5, 3.0, 3.5, 4.0]} 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value: any, name: any) => [
                      `${Number(value).toFixed(2)} / 4.00`, 
                      name === 'gpa4' ? 'GPA Hệ 4' : name
                    ]}
                  />
                  <ReferenceLine 
                    y={userProfile.targetCumulativeGpa4} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Target', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gpa4" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#gpaGradient)" 
                    dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#60a5fa' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>💡 Mẹo: Duy trì tối thiểu <strong className="text-cyan-300">3.60</strong> để giữ bằng tốt nghiệp Xuất Sắc</span>
            <button 
              onClick={() => setActiveTab('graduation')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>Xem chi tiết lộ trình</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Grade Distribution Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Phân Bổ Điểm Chữ</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">{courses.length} môn</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Số lượng các môn học theo từng thang điểm chữ (A+, A, B+, B, C, D)
            </p>

            <div className="h-56 w-full">
              {gradeDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="letter" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#f8fafc'
                      }}
                      labelStyle={{ color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(val: any) => [`${val} môn`, 'Số lượng']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Chưa có dữ liệu điểm môn học
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tỷ lệ điểm A/A+:</span>
            <span className="text-emerald-400 font-bold">
              {courses.length > 0 
                ? `${Math.round(((gradeCountMap['A+'] + gradeCountMap['A']) / courses.length) * 100)}%` 
                : '0%'}
            </span>
          </div>
        </div>

      </div>

      {/* Secondary Row: Today's Schedule & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Schedule Widget */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Lịch Học Hôm Nay</h3>
                <p className="text-xs text-slate-400">
                  {currentDayOfWeek === 8 ? 'Chủ Nhật' : `Thứ ${currentDayOfWeek}`} • {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>Toàn bộ tuần</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map(cls => (
                <div 
                  key={cls.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between hover:bg-slate-800 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: cls.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-300">{cls.code}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                          {cls.credits} TC
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{cls.name}</h4>
                      {cls.instructor && (
                        <p className="text-xs text-slate-400">{cls.instructor}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cls.schedule?.timeSlot}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Phòng: <strong className="text-slate-200">{cls.schedule?.room}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-800">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Hôm nay không có tiết học trên trường! 🎉</p>
              <p className="text-xs text-slate-500 mt-1">Hãy dành thời gian làm bài tập hoặc ôn tập thi cuối kỳ.</p>
            </div>
          )}
        </div>

        {/* Urgent Deadlines Widget */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Deadlines Cần Chú Ý</h3>
                <p className="text-xs text-slate-400">
                  {pendingTasks.length} bài tập &amp; nhiệm vụ đang chờ xử lý
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {urgentTasks.length > 0 ? (
            <div className="space-y-2.5">
              {urgentTasks.map(task => {
                const linkedCourse = courses.find(c => c.id === task.courseId);
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <div 
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <button
                        onClick={() => handleTaskCheck(task.id)}
                        className="w-5 h-5 rounded-md border border-slate-600 hover:border-emerald-400 flex items-center justify-center text-transparent hover:text-emerald-400 transition cursor-pointer flex-shrink-0"
                        title="Đánh dấu hoàn thành"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400">
                          {linkedCourse && (
                            <span className="font-mono text-cyan-400 truncate max-w-[120px]">
                              {linkedCourse.code}
                            </span>
                          )}
                          <span>•</span>
                          <span className={isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                            Hạn: {task.dueDate} {isOverdue && '(Quá hạn)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {task.priority === 'high' ? 'Gấp' : task.priority === 'medium' ? 'Vừa' : 'Thấp'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Tuyệt vời! Không còn deadline nào tồn đọng 🎯</p>
              <p className="text-xs text-slate-500 mt-1">Bạn đang quản lý thời gian học tập rất tốt.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
