import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles,
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { calculateGPA, calculateCourseGrade } from '../utils/gradeCalculations';

export const GraduationPlannerView: React.FC = () => {
  const { courses, semesters, userProfile, updateUserProfile } = useUniPlanStore();

  const overallStats = calculateGPA(courses);
  const earnedCredits = overallStats.totalEarnedCredits;
  const totalRequiredCredits = userProfile.totalRequiredCredits || 135;
  const inProgressCredits = courses
    .filter(c => c.status === 'in-progress')
    .reduce((sum, c) => sum + c.credits, 0);

  const remainingCredits = Math.max(0, totalRequiredCredits - earnedCredits);
  const progressPercent = Math.min(100, Math.round((earnedCredits / totalRequiredCredits) * 100));

  // State cho mục tiêu tốt nghiệp
  const [targetDegreeRank, setTargetDegreeRank] = useState<number>(userProfile.targetCumulativeGpa4 || 3.6);

  // Tính GPA các kỳ tới cần đạt:
  // (targetGPA * totalCredits - currentGPA * earnedCredits) / remainingCredits
  const calculateRequiredFutureGPA = (targetGPA: number) => {
    if (remainingCredits <= 0) return null;
    const currentPoints = overallStats.gpa4 * earnedCredits;
    const targetTotalPoints = targetGPA * totalRequiredCredits;
    const neededPoints = targetTotalPoints - currentPoints;
    const neededGPA = neededPoints / remainingCredits;
    return Math.round(neededGPA * 100) / 100;
  };

  const requiredFutureGPA = calculateRequiredFutureGPA(targetDegreeRank);

  // Danh sách các môn có thể học cải thiện (điểm D, D+, C, C+)
  const improvableCourses = courses.filter(c => {
    if (c.status !== 'completed') return false;
    const g = calculateCourseGrade(c);
    const score = g.finalScore10;
    return score !== null && score < 7.0; // Dưới điểm B
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Kiểm Toán Tín Chỉ &amp; Bằng Tốt Nghiệp</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Lộ Trình Tích Lũy Tín Chỉ &amp; Xếp Hạng Tốt Nghiệp
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Tính toán chính xác tiến độ hoàn thành chương trình đào tạo đại học và GPA cần duy trì trong các học kỳ còn lại.
          </p>
        </div>

        {/* Edit Required Credits Input */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center space-x-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Khung chương trình:</span>
            <span className="text-white font-bold text-sm">{totalRequiredCredits} Tín chỉ</span>
          </div>
          <button
            onClick={() => {
              const val = prompt('Nhập tổng số tín chỉ yêu cầu tốt nghiệp của ngành bạn:', String(totalRequiredCredits));
              if (val && Number(val) > 0) {
                updateUserProfile({ totalRequiredCredits: Number(val) });
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-semibold border border-slate-700 transition cursor-pointer"
          >
            Đổi
          </button>
        </div>
      </div>

      {/* Credit Progress Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Đã Tích Lũy
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {earnedCredits}
            </span>
            <span className="text-xs text-slate-400">/ {totalRequiredCredits} TC</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Đạt <strong>{progressPercent}%</strong> điều kiện ra trường
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Tín Chỉ Còn Thiếu
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {remainingCredits}
            </span>
            <span className="text-xs text-slate-400">tín chỉ</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-4 block">
            Khoảng ~{Math.ceil(remainingCredits / 15)} học kỳ nữa (15 TC/kỳ)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Đang Học Kỳ Này
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-blue-400 font-mono">
              +{inProgressCredits}
            </span>
            <span className="text-xs text-slate-400">tín chỉ</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-4 block">
            Nếu qua hết sẽ đạt <strong>{earnedCredits + inProgressCredits} TC</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Xếp Loại Hiện Tại
          </span>
          <div className="mt-1">
            <span className="text-xl font-black text-white block">
              {overallStats.honor.title.split(' ')[0]}
            </span>
            <span className="text-xs text-slate-400">
              GPA: <strong className="text-cyan-300 font-mono">{overallStats.gpa4.toFixed(2)}</strong> / 4.00
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 block">
            Hệ 10: <strong className="text-slate-300">{overallStats.gpa10.toFixed(2)}</strong>
          </span>
        </div>

      </div>

      {/* Honors Target Advisor */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Dự Toán Xếp Hạng Bằng Tốt Nghiệp Đại Học</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Để tốt nghiệp với xếp loại mong muốn, bạn cần duy trì GPA bao nhiêu cho các tín chỉ còn lại?
            </p>
          </div>

          {/* Target Degree Preset Buttons */}
          <div className="flex items-center space-x-2">
            {[
              { label: 'Xuất Sắc (≥3.60)', gpa: 3.60 },
              { label: 'Giỏi (≥3.20)', gpa: 3.20 },
              { label: 'Khá (≥2.50)', gpa: 2.50 },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => {
                  setTargetDegreeRank(preset.gpa);
                  updateUserProfile({ targetCumulativeGpa4: preset.gpa });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  targetDegreeRank === preset.gpa
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Mục tiêu: GPA ≥ {targetDegreeRank.toFixed(2)} ({targetDegreeRank >= 3.6 ? 'Bằng Xuất Sắc' : targetDegreeRank >= 3.2 ? 'Bằng Giỏi' : 'Bằng Khá'})
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xs text-slate-400">Các tín chỉ còn lại ({remainingCredits} TC) cần đạt trung bình:</span>
              <span className={`text-3xl font-black font-mono ${
                requiredFutureGPA === null
                  ? 'text-slate-400'
                  : requiredFutureGPA <= 0
                  ? 'text-emerald-400'
                  : requiredFutureGPA <= 4.0
                  ? 'text-cyan-300'
                  : 'text-rose-400'
              }`}>
                {requiredFutureGPA === null
                  ? 'Đã xong'
                  : requiredFutureGPA <= 0
                  ? '0.00 (Đã nắm chắc)'
                  : requiredFutureGPA.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ 4.00</span>
            </div>
          </div>

          <div className="text-left md:text-right">
            {requiredFutureGPA !== null && requiredFutureGPA <= 4.0 && requiredFutureGPA > 0 && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hoàn toàn khả thi! Duy trì học lực tốt</span>
              </div>
            )}
            {requiredFutureGPA !== null && requiredFutureGPA <= 0 && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bạn đã chắc chắn đạt loại này! 🎉</span>
              </div>
            )}
            {requiredFutureGPA !== null && requiredFutureGPA > 4.0 && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Cần &gt; 4.00 (Không thể đạt nếu không học cải thiện)</span>
              </div>
            )}
          </div>
        </div>

        {/* Advice on retaking courses */}
        {improvableCourses.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Gợi ý học cải thiện (Retake) để bứt phá GPA:</span>
            </div>
            <p className="text-slate-300">
              Bạn có <strong>{improvableCourses.length} môn học</strong> điểm dưới B (7.0). Học lại các môn này để nâng lên A/B+ sẽ đẩy vọt GPA tích lũy của bạn:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {improvableCourses.map(c => {
                const g = calculateCourseGrade(c);
                return (
                  <span key={c.id} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 font-medium text-amber-200 text-xs flex items-center space-x-1">
                    <span>{c.code} ({c.name})</span>
                    <strong className="text-rose-400">({g.finalScore10?.toFixed(1) ?? '—'})</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Semester by Semester Audit Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Bảng Tổng Hợp Tín Chỉ Theo Từng Học Kỳ</span>
          </h2>
          <span className="text-xs text-slate-400">{semesters.length} học kỳ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="p-3">Học kỳ</th>
                <th className="p-3 text-center">Số môn</th>
                <th className="p-3 text-center">Tín chỉ đăng ký</th>
                <th className="p-3 text-center">Tín chỉ đạt</th>
                <th className="p-3 text-center">GPA Hệ 10</th>
                <th className="p-3 text-center">GPA Hệ 4</th>
                <th className="p-3 text-right">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {semesters.map((sem) => {
                const semCourses = courses.filter(c => c.semester === sem.id);
                const stats = calculateGPA(semCourses);

                return (
                  <tr key={sem.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white flex items-center space-x-2">
                      <span>{sem.name}</span>
                      {sem.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                          Hiện tại
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">{semCourses.length}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-200">{stats.totalCredits} TC</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400">{stats.totalEarnedCredits} TC</td>
                    <td className="p-3 text-center font-mono font-bold text-cyan-300">
                      {stats.totalCredits > 0 ? stats.gpa10.toFixed(2) : '—'}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-blue-400">
                      {stats.totalCredits > 0 ? stats.gpa4.toFixed(2) : '—'}
                    </td>
                    <td className="p-3 text-right">
                      {stats.totalCredits > 0 ? (
                        <span className="font-semibold text-slate-200">
                          {stats.honor.title.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
