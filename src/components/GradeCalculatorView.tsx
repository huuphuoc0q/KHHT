import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Target, 
  Sliders, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { 
  calculateCourseGrade, 
  getComponentScore, 
  solveRequiredComponentScore, 
  calculateAllGradeTargets,
  convertScoreToGrade,
  calculateGPA
} from '../utils/gradeCalculations';
import confetti from 'canvas-confetti';

interface GradeCalculatorViewProps {
  initialCourseId?: string | null;
}

export const GradeCalculatorView: React.FC<GradeCalculatorViewProps> = ({ initialCourseId }) => {
  const { courses, userProfile, activeSemesterId } = useUniPlanStore();

  // Danh sách các môn học (ưu tiên các môn đang học)
  const availableCourses = courses.filter(c => 
    activeSemesterId === 'ALL' || c.semester === activeSemesterId
  );

  const defaultCourse = (initialCourseId && courses.find(c => c.id === initialCourseId))
    || availableCourses.find(c => c.status === 'in-progress') 
    || courses[0];

  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourse?.id || '');
  
  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  const course = courses.find(c => c.id === selectedCourseId);

  // Chọn component cần tính (mặc định là cột chưa có điểm hoặc cột cuối)
  const defaultComp = course?.gradeComponents.find(c => getComponentScore(c) === null) 
    || course?.gradeComponents[course.gradeComponents.length - 1];

  const [selectedCompId, setSelectedCompId] = useState<string>(defaultComp?.id || '');

  useEffect(() => {
    if (course) {
      const missing = course.gradeComponents.find(c => getComponentScore(c) === null);
      setSelectedCompId(missing?.id || course.gradeComponents[course.gradeComponents.length - 1]?.id || '');
    }
  }, [course]);

  // Mục tiêu tùy chỉnh của người dùng
  const [customTarget, setCustomTarget] = useState<number>(course?.targetGradeSystem10 || 8.5);

  // Thanh trượt giả lập điểm thi (What-if slider)
  const [simulatedScore, setSimulatedScore] = useState<number>(8.0);

  if (!course) {
    return (
      <div className="py-20 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
        <Calculator className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Chưa có môn học nào</h3>
        <p className="text-xs text-slate-400 mt-1">Hãy thêm môn học để bắt đầu dự toán điểm thi.</p>
      </div>
    );
  }

  // Component được chọn để dự toán
  const targetComp = course.gradeComponents.find(c => c.id === selectedCompId) || course.gradeComponents[0];

  // Tính toán tất cả mốc mục tiêu
  const allTargets = calculateAllGradeTargets(course, targetComp?.id);

  // Tính kết quả cho mục tiêu tùy chỉnh
  const customTargetResult = solveRequiredComponentScore(course, customTarget, targetComp?.id);

  // --- Tính toán What-If Simulation ---
  // Thay thế điểm của targetComp bằng simulatedScore để tính điểm giả lập
  const simulatedComponents = course.gradeComponents.map(c => {
    if (c.id === targetComp?.id) {
      return { ...c, score: simulatedScore, subGrades: [] };
    }
    return c;
  });

  const simulatedCourse = { ...course, gradeComponents: simulatedComponents };
  const simulatedGrade = calculateCourseGrade(simulatedCourse);

  // Dự đoán tác động đến GPA toàn khóa nếu thi đạt simulatedScore
  const simulatedAllCourses = courses.map(c => c.id === course.id ? simulatedCourse : c);
  const currentOverallStats = calculateGPA(courses);
  const simulatedOverallStats = calculateGPA(simulatedAllCourses);
  const gpaDelta = Math.round((simulatedOverallStats.gpa4 - currentOverallStats.gpa4) * 100) / 100;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Course Picker */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Thuật Toán Dự Toán Điểm Thi Thông Minh</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Dự Toán &amp; Mô Phỏng Điểm Thi Cuối Kỳ
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-lg">
            Biết chính xác bạn cần thi tối thiểu bao nhiêu điểm để đạt điểm A, B+ hoặc qua môn an toàn.
          </p>
        </div>

        {/* Course Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Chọn môn học:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-800 text-xs font-bold text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[240px]"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name} ({c.credits} TC)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Component Selector & Course Process Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Chọn Cột Điểm Cần Giải */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            1. Cột điểm dự toán:
          </label>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full bg-slate-800 text-sm font-bold text-cyan-300 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            {course.gradeComponents.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (Trọng số: {c.weight}%)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Trọng số: <strong className="text-white">{targetComp?.weight}%</strong> tổng điểm môn
          </p>
        </div>

        {/* Card 2: Điểm Quá Trình Đã Có */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            2. Điểm tích lũy đã có:
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">
              {calculateCourseGrade(course).accumulatedWeightedScore.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">
              / {calculateCourseGrade(course).enteredWeight}% trọng số
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Dựa trên các bài chuyên cần, giữa kỳ, thực hành đã nhập
          </p>
        </div>

        {/* Card 3: Mục Tiêu Cá Nhân Của Bạn */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            3. Mục tiêu bạn muốn đạt (Hệ 10):
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={customTarget}
              onChange={(e) => setCustomTarget(Number(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-base font-bold text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${convertScoreToGrade(customTarget).badgeColor}`}>
              Điểm {convertScoreToGrade(customTarget).letter} ({convertScoreToGrade(customTarget).system4})
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {customTargetResult.isAlreadyAchieved ? (
              <span className="text-emerald-400 font-semibold">✓ Đã đủ điểm, thi 0 điểm cũng đạt!</span>
            ) : customTargetResult.isFeasible && customTargetResult.requiredScore !== null ? (
              <span className="text-cyan-300 font-semibold">
                Cần tối thiểu: {customTargetResult.requiredScore.toFixed(1)} điểm
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">Không khả thi (vượt quá 10)</span>
            )}
          </p>
        </div>

      </div>

      {/* Main Grid: Target Table on Left, What-If Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Standard Targets Table */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Bảng Điểm Thi Cần Đạt Cho Từng Xếp Loại</span>
              </h2>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                Cột: {targetComp?.name}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Dựa vào trọng số {targetComp?.weight}% và các điểm quá trình hiện có, bạn cần đạt:
            </p>

            <div className="space-y-2.5">
              {allTargets.map((target) => {
                const isPassedTarget = target.isAlreadyAchieved;
                const isPossible = target.isFeasible && target.requiredScore !== null;

                return (
                  <div
                    key={target.letter}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isPassedTarget
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                        : isPossible
                        ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                        : 'bg-rose-950/10 border-rose-900/30 opacity-75'
                    }`}
                  >
                    {/* Left: Grade Target Info */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        target.letter.startsWith('A')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : target.letter.startsWith('B')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : target.letter.startsWith('C')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      }`}>
                        {target.letter}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">
                            {target.targetLabel}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (≥ {target.targetScore10.toFixed(1)})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Hệ 4: {target.system4.toFixed(1)} điểm
                        </span>
                      </div>
                    </div>

                    {/* Right: Required score badge */}
                    <div className="text-right">
                      {isPassedTarget ? (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã chắc chắn đạt</span>
                        </div>
                      ) : isPossible ? (
                        <div>
                          <div className="flex items-baseline justify-end space-x-1">
                            <span className="text-xs text-slate-400">Cần:</span>
                            <span className="text-lg font-black text-cyan-300 font-mono">
                              {target.requiredScore?.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-400">/ 10</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            (Thi tối thiểu {target.requiredScore?.toFixed(1)})
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 text-xs font-medium border border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Không khả thi (&gt;10)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>💡 Lời khuyên: Tập trung ôn tập môn {course.code} vì có {course.credits} tín chỉ.</span>
          </div>
        </div>

        {/* Right: Real-time What-If Simulator */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Mô Phỏng Điểm Thi ("What-If Scenario")</span>
              </h2>
              <span className="text-xs text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Thời gian thực
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Kéo thanh trượt để giả định điểm thi {targetComp?.name} và xem ngay kết quả tổng kết môn học &amp; tác động đến GPA toàn khóa:
            </p>

            {/* Interactive Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Giả định thi được:
                </span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-cyan-300 font-mono">
                    {simulatedScore.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 10</span>
                </div>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={simulatedScore}
                onChange={(e) => setSimulatedScore(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0.0</span>
                <span>2.5</span>
                <span>5.0</span>
                <span>7.5</span>
                <span>10.0</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              
              {/* Box 1: Tổng kết môn học giả định */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Tổng Kết Môn Này
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {simulatedGrade.finalScore10?.toFixed(2) ?? '—'}
                </span>
                <div className="mt-1 flex items-center justify-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${simulatedGrade.conversion.badgeColor}`}>
                    {simulatedGrade.conversion.letter}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    ({simulatedGrade.conversion.system4.toFixed(1)})
                  </span>
                </div>
              </div>

              {/* Box 2: GPA Toàn khóa thay đổi */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
                  GPA Toàn Khóa Sẽ Là
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {simulatedOverallStats.gpa4.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {gpaDelta > 0 ? (
                    <strong className="text-emerald-400">+{gpaDelta.toFixed(2)} so với hiện tại</strong>
                  ) : gpaDelta < 0 ? (
                    <strong className="text-rose-400">{gpaDelta.toFixed(2)} so với hiện tại</strong>
                  ) : (
                    'Không đổi'
                  )}
                </span>
              </div>

            </div>

            {/* Smart Assessment Text */}
            <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Nhận xét:</strong>{' '}
                  {simulatedGrade.conversion.letter.startsWith('A') ? (
                    <span>
                      Nếu thi được <strong>{simulatedScore.toFixed(1)}</strong>, bạn sẽ xuất sắc giành được điểm <strong>{simulatedGrade.conversion.letter}</strong> môn {course.code}! Điểm này đóng góp lớn cho mục tiêu bằng {userProfile.targetCumulativeGpa4 >= 3.6 ? 'Xuất Sắc' : 'Giỏi'}.
                    </span>
                  ) : simulatedGrade.conversion.letter.startsWith('B') ? (
                    <span>
                      Với mức <strong>{simulatedScore.toFixed(1)}</strong>, bạn đạt điểm <strong>{simulatedGrade.conversion.letter}</strong> (Khá). Nếu nỗ lực thêm để chạm mốc A, bạn cần ôn thêm các phần trọng tâm.
                    </span>
                  ) : (
                    <span>
                      Với mức <strong>{simulatedScore.toFixed(1)}</strong>, bạn đạt điểm {simulatedGrade.conversion.letter}. Hãy cẩn trọng để tránh kéo tụt GPA tích lũy.
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Môn: <strong className="text-white">{course.name}</strong></span>
            <span>{course.credits} Tín chỉ</span>
          </div>
        </div>

      </div>

    </div>
  );
};
