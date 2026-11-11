import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Percent, 
  Layers, 
  Calculator, 
  Scale, 
  Info 
} from 'lucide-react';
import { Course, GradeComponent, SubGrade } from '../types';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { getComponentScore, calculateCourseGrade } from '../utils/gradeCalculations';

interface GradeDetailModalProps {
  courseId: string;
  onClose: () => void;
  onOpenCalculatorForCourse?: (courseId: string) => void;
}

export const GradeDetailModal: React.FC<GradeDetailModalProps> = ({
  courseId,
  onClose,
  onOpenCalculatorForCourse,
}) => {
  const { 
    courses, 
    updateCourse, 
    addGradeComponent, 
    updateGradeComponent, 
    deleteGradeComponent,
    addSubGrade,
    updateSubGrade,
    deleteSubGrade 
  } = useUniPlanStore();

  const course = courses.find((c) => c.id === courseId);

  // Trạng thái mở rộng danh sách subGrades cho từng component
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);

  // State thêm nhanh component
  const [isAddingComp, setIsAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompWeight, setNewCompWeight] = useState<number>(20);

  // State thêm nhanh subgrade
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubScore, setNewSubScore] = useState<string>('');
  const [newSubMax, setNewSubMax] = useState<number>(10);

  if (!course) return null;

  const { totalWeight, enteredWeight, accumulatedWeightedScore, finalScore10, currentAverage10, conversion } = calculateCourseGrade(course);
  const isWeight100 = totalWeight === 100;

  // Tự động phân bổ lại trọng số thành 100%
  const handleNormalizeWeights = () => {
    if (course.gradeComponents.length === 0) return;
    const currentSum = course.gradeComponents.reduce((acc, c) => acc + c.weight, 0);
    if (currentSum === 0) return;

    const normalizedComponents = course.gradeComponents.map((c) => ({
      ...c,
      weight: Math.round((c.weight / currentSum) * 100),
    }));

    // Sửa lệch 1 đơn vị nếu làm tròn chưa bằng 100
    const newSum = normalizedComponents.reduce((acc, c) => acc + c.weight, 0);
    if (newSum !== 100 && normalizedComponents.length > 0) {
      normalizedComponents[normalizedComponents.length - 1].weight += (100 - newSum);
    }

    updateCourse(course.id, { gradeComponents: normalizedComponents });
  };

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    addGradeComponent(course.id, {
      name: newCompName.trim(),
      weight: Number(newCompWeight) || 10,
      score: null,
      subGrades: [],
    });
    setNewCompName('');
    setIsAddingComp(false);
  };

  const handleCreateSubGrade = (componentId: string) => {
    if (!newSubTitle.trim()) return;
    const parsedScore = newSubScore === '' ? null : Number(newSubScore);
    addSubGrade(course.id, componentId, {
      title: newSubTitle.trim(),
      score: parsedScore,
      maxScore: Number(newSubMax) || 10,
    });
    setNewSubTitle('');
    setNewSubScore('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3.5 h-10 rounded-full" 
              style={{ backgroundColor: course.color || '#3b82f6' }} 
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {course.code}
                </span>
                <span className="text-xs text-slate-400 font-medium">{course.credits} Tín chỉ</span>
                <span className="text-xs text-slate-400">• {course.semester}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{course.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Grade Summary KPI strip */}
        <div className="bg-slate-950/60 p-4 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Tổng Trọng Số</span>
            <div className="flex items-center justify-center space-x-1 mt-0.5">
              <span className={`text-base font-bold ${isWeight100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalWeight}%
              </span>
              {!isWeight100 && (
                <span title="Tổng trọng số phải bằng 100%">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline" />
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Điểm Quá Trình</span>
            <span className="text-base font-bold text-cyan-300 mt-0.5 block">
              {currentAverage10 !== null ? `${currentAverage10.toFixed(2)} / 10` : '—'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Tổng Kết Hệ 10</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {finalScore10 !== null ? finalScore10.toFixed(2) : 'Chưa xong'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Điểm Chữ &amp; Hệ 4</span>
            <div className="flex items-center justify-center space-x-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${conversion.badgeColor}`}>
                {conversion.letter}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                ({conversion.system4.toFixed(1)})
              </span>
            </div>
          </div>
        </div>

        {/* Weight Alert Banner if not 100% */}
        {!isWeight100 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                Tổng trọng số hiện tại là <strong>{totalWeight}%</strong> (
                {totalWeight < 100 ? `Thiếu ${100 - totalWeight}%` : `Vượt quá ${totalWeight - 100}%`}
                ).
              </span>
            </div>
            <button
              onClick={handleNormalizeWeights}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-medium transition cursor-pointer"
            >
              <Scale className="w-3 h-3" />
              <span>Cân bằng 100%</span>
            </button>
          </div>
        )}

        {/* Body Component List */}
        <div className="flex-1 overflow-y-auto p-5 space-x-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Các Cột Điểm Thành Phần
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập điểm trực tiếp (0-10) hoặc chia nhỏ thành các bài Quiz / Lab con
              </p>
            </div>

            <button
              onClick={() => setIsAddingComp(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm cột điểm</span>
            </button>
          </div>

          {/* Form thêm cột điểm mới */}
          {isAddingComp && (
            <form onSubmit={handleCreateComponent} className="p-4 rounded-xl bg-slate-800/80 border border-blue-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300">Thêm cột điểm mới:</span>
                <button 
                  type="button" 
                  onClick={() => setIsAddingComp(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Tên cột điểm</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thi Cuối kỳ, Báo cáo Đồ án, Lab 1..."
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Trọng số (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={newCompWeight}
                      onChange={(e) => setNewCompWeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingComp(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Thêm Cột
                </button>
              </div>
            </form>
          )}

          {/* List of components */}
          <div className="space-y-3">
            {course.gradeComponents.map((comp) => {
              const effectiveScore = getComponentScore(comp);
              const hasSubGrades = comp.subGrades && comp.subGrades.length > 0;
              const isExpanded = expandedCompId === comp.id;

              return (
                <div 
                  key={comp.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Component Name & Weight */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex flex-col items-center justify-center border border-slate-600/40 text-center flex-shrink-0">
                        <span className="text-xs font-bold text-cyan-300">{comp.weight}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => updateGradeComponent(course.id, comp.id, { name: e.target.value })}
                          className="bg-transparent font-semibold text-sm text-white focus:outline-none focus:bg-slate-900/60 px-1.5 py-0.5 rounded border border-transparent focus:border-slate-600 w-full"
                        />
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Trọng số:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={comp.weight}
                            onChange={(e) => updateGradeComponent(course.id, comp.id, { weight: Number(e.target.value) })}
                            className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white"
                          />
                          <span>%</span>
                          {hasSubGrades && (
                            <span className="text-indigo-400 font-medium">
                              • Gồm {comp.subGrades.length} điểm con
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score input & action */}
                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <div>
                        {hasSubGrades ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              {effectiveScore !== null ? effectiveScore.toFixed(2) : '—'} / 10
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              (Tự động tính)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="Chưa có"
                              value={comp.score !== null ? comp.score : ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : Number(e.target.value);
                                updateGradeComponent(course.id, comp.id, { score: val });
                              }}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-center text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                            />
                            <span className="text-xs text-slate-400">/ 10</span>
                          </div>
                        )}
                      </div>

                      {/* Toggle SubGrades Drawer */}
                      <button
                        onClick={() => setExpandedCompId(isExpanded ? null : comp.id)}
                        className={`p-2 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center space-x-1 ${
                          isExpanded || hasSubGrades
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-slate-700/60 text-slate-400 border-slate-600 hover:text-slate-200'
                        }`}
                        title="Chia nhỏ thành các điểm con (Quiz, Lab, Assignment)"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Điểm con</span>
                      </button>

                      {/* Delete component */}
                      <button
                        onClick={() => deleteGradeComponent(course.id, comp.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Xóa cột điểm này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* SubGrades Section when expanded */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-700/60 bg-slate-900/50 p-3 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Chi tiết điểm con cho "{comp.name}":</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Điểm trung bình tự động: <strong className="text-emerald-400">{effectiveScore !== null ? effectiveScore.toFixed(2) : '—'}</strong>
                        </span>
                      </div>

                      {/* SubGrades Table */}
                      {comp.subGrades.length > 0 ? (
                        <div className="space-y-1.5">
                          {comp.subGrades.map((sg) => (
                            <div 
                              key={sg.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 text-xs"
                            >
                              <input
                                type="text"
                                value={sg.title}
                                onChange={(e) => updateSubGrade(course.id, comp.id, sg.id, { title: e.target.value })}
                                className="bg-transparent text-slate-200 font-medium focus:outline-none focus:bg-slate-900 px-1 rounded flex-1 mr-2"
                              />

                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={sg.maxScore || 10}
                                  placeholder="Điểm"
                                  value={sg.score !== null ? sg.score : ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                    updateSubGrade(course.id, comp.id, sg.id, { score: val });
                                  }}
                                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-white text-xs"
                                />
                                <span className="text-slate-400">/ {sg.maxScore || 10}</span>

                                <button
                                  onClick={() => deleteSubGrade(course.id, comp.id, sg.id)}
                                  className="text-slate-400 hover:text-rose-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 py-1 italic">
                          Chưa có bài kiểm tra con nào. Thêm bên dưới:
                        </p>
                      )}

                      {/* Quick Add SubGrade Input */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Tên bài (ví dụ: Quiz 1, Bài tập 2...)"
                          value={newSubTitle}
                          onChange={(e) => setNewSubTitle(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1 w-full"
                        />
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="Điểm số"
                            value={newSubScore}
                            onChange={(e) => setNewSubScore(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white w-20 text-center font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleCreateSubGrade(comp.id)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition cursor-pointer flex-shrink-0"
                          >
                            + Thêm điểm con
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {course.gradeComponents.length === 0 && (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl">
              <Calculator className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Chưa có cột điểm nào</p>
              <p className="text-xs text-slate-500 mt-1">
                Bấm "+ Thêm cột điểm" để tạo Chuyên cần, Giữa kỳ, Cuối kỳ...
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer with Quick Solver Shortcut */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Dữ liệu điểm được tự động lưu ngay vào bộ nhớ máy</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {onOpenCalculatorForCourse && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCalculatorForCourse(course.id);
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md transition cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Dự toán thi cuối kỳ môn này</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
