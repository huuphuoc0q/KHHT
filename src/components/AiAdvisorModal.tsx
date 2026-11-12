import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Send, 
  BrainCircuit, 
  Clock, 
  Award,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { calculateGPA, calculateCourseGrade, convertScoreToGrade } from '../utils/gradeCalculations';

interface AiAdvisorModalProps {
  onClose: () => void;
  onOpenCalculatorForCourse: (courseId: string) => void;
}

// Hàm chuẩn hóa chuỗi tiếng Việt
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ onClose, onOpenCalculatorForCourse }) => {
  const { courses, tasks, userProfile, activeSemesterId } = useUniPlanStore();

  const [customQuestion, setCustomQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Chào ${userProfile.studentName || 'bạn'}! Tôi là UniPlan AI - Cố vấn học tập tín chỉ của bạn.\nTôi đã phân tích toàn bộ ${courses.length} học phần và danh sách công việc của bạn.\nBạn muốn tính điểm thi cần đạt, kiểm tra deadline khẩn cấp, mô phỏng điểm số hay gợi ý học cải thiện?`,
      time: 'Vừa xong',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // 1. Phân tích điểm cơ bản (Loại trừ môn điều kiện MILI, PHYL)
  const gpaCourses = courses.filter(c => !c.code.toUpperCase().startsWith('MILI') && !c.code.toUpperCase().startsWith('PHYL'));
  const overall = calculateGPA(courses); 
  const inProgressCourses = courses.filter(c => c.status === 'in-progress' && !c.code.toUpperCase().startsWith('MILI') && !c.code.toUpperCase().startsWith('PHYL'));
  const currentTotalCredits = overall.totalEarnedCredits;

  // 2. Môn gánh team (top điểm cao)
  const topCourses = [...gpaCourses]
    .filter(c => c.status === 'completed')
    .sort((a, b) => (calculateCourseGrade(b).finalScore10 || 0) - (calculateCourseGrade(a).finalScore10 || 0))
    .slice(0, 3);

  // 3. Môn kéo điểm và Delta GPA (Hàm an toàn lấy điểm hệ 4)
  const getGrade4 = (score: number) => {
    const converted = convertScoreToGrade(score) as any;
    if (typeof converted === 'number') return converted;
    if (converted && typeof converted.system4 === 'number') return converted.system4;
    if (converted && typeof converted.gpa4 === 'number') return converted.gpa4;
    if (score >= 8.5) return 4.0;
    if (score >= 7.8) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.3) return 2.5;
    if (score >= 5.5) return 2.0;
    if (score >= 4.0) return 1.0;
    return 0.0;
  };

  const improvementCourses = [...gpaCourses]
    .filter(c => c.status === 'completed')
    .map(c => {
      const g = calculateCourseGrade(c);
      const score10 = g.finalScore10;
      if (score10 === null) return null;
      
      const currentGrade4 = getGrade4(score10);
      if (currentGrade4 >= 3.0) return null;

      const potentialGainPoints = (4.0 - currentGrade4) * c.credits;
      const deltaGpa = currentTotalCredits > 0 ? (potentialGainPoints / currentTotalCredits) : 0;

      return { course: c, score10, currentGrade4, deltaGpa };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.deltaGpa || 0) - (a?.deltaGpa || 0));

  // 4. Ma trận ưu tiên ôn thi
  const studyPriorities = inProgressCourses.map(c => {
    const finalComp = c.gradeComponents.find(comp => /cuối|final|thi/i.test(comp.name)) 
      || c.gradeComponents[c.gradeComponents.length - 1];
    const examWeight = finalComp ? finalComp.weight : 50;
    let priorityScore = c.credits * examWeight;
    const grade = calculateCourseGrade(c);
    
    return {
      course: c,
      finalCompName: finalComp?.name || 'Thi Cuối kỳ',
      examWeight,
      priorityScore,
      currentAvg: grade.currentAverage10,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  const totalPrioritySum = studyPriorities.reduce((sum, item) => sum + item.priorityScore, 0);

  // ---------- BỘ MÁY XỬ LÝ LÝ LUẬN CỐ VẤN ----------
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || customQuestion;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setCustomQuestion('');
    setIsThinking(true);

    setTimeout(() => {
      let response = '';
      const normalizedQuery = normalizeString(query);

      // A. KIỂM TRA TÍNH NĂNG NHẮC DEADLINE KHẨN CẤP
      if (normalizedQuery.includes("deadline") || normalizedQuery.includes("bai tap") || normalizedQuery.includes("nhac viec") || normalizedQuery.includes("can lam")) {
        const activeTasks = tasks.filter(t => t.status !== 'done');
        if (activeTasks.length === 0) {
          response = `🎉 **Tuyệt vời!** Không có deadline nào đang chờ xử lý. Bạn đang quản lý thời gian học tập rất tốt!`;
        } else {
          response = `⚠️ **Danh sách công việc & Deadline cần chú ý**:
${activeTasks.map((task, idx) => {
  const matchedCourse = courses.find(c => c.id === task.courseId);
  return `**${idx + 1}. [${matchedCourse ? matchedCourse.code : 'Chung'}] ${task.title}**\n   - Hạn nộp: ${task.dueDate} | Ưu tiên: ${task.priority.toUpperCase()}`;
}).join('\n\n')}
💡 *Lời khuyên*: Hãy giải quyết các nhiệm vụ ưu tiên cao trước để giải tỏa tâm lý trước kỳ thi!`;
        }
      } 
      // B. KIỂM TRA MÃ MÔN CỤ THỂ KÈM TÍNH NGƯỢC ĐIỂM THI (REVERSE ENGINEERING)
      else {
        const mentionedCourse = courses.find(c => normalizedQuery.includes(c.code.toLowerCase()) || normalizedQuery.includes(normalizeString(c.name)));
        if (mentionedCourse) {
          const cGrade = calculateCourseGrade(mentionedCourse);
          const target = mentionedCourse.targetGradeSystem10 || 8.5;
          const currentAvg = cGrade.currentAverage10; // Điểm quá trình tích lũy hiện tại (trước khi tính thi cuối kỳ)
          
          // Tìm cột thi cuối kỳ
          const finalComp = mentionedCourse.gradeComponents.find(comp => /cuối|final|thi/i.test(comp.name)) 
            || mentionedCourse.gradeComponents[mentionedCourse.gradeComponents.length - 1];
          const weightFinal = finalComp ? finalComp.weight / 100 : 0.6; // Mặc định 60% nếu không tìm thấy
          const weightProcess = 1 - weightFinal;

          let calculationText = '';
          if (currentAvg !== null && currentAvg > 0) {
            // Công thức: Target = Process * weightProcess + Final * weightFinal
            // => Final = (Target - Process * weightProcess) / weightFinal
            const requiredFinal = (target - (currentAvg * weightProcess)) / weightFinal;
            const clampedFinal = Math.max(0, Math.min(10, Math.round(requiredFinal * 100) / 100));
            
            calculationText = `\n- Điểm quá trình hiện tại: **${currentAvg.toFixed(2)}** (chiếm ${Math.round(weightProcess * 100)}%).
- Mục tiêu điểm tổng kết: **${target} (${convertScoreToGrade(target).letter})**.
- 🎯 **Nhiệm vụ thi cuối kỳ**: Bạn cần đạt tối thiểu **${clampedFinal}/10** ở bài thi cuối kỳ (${Math.round(weightFinal * 100)}% trọng số) để chạm mục tiêu!`;
          } else {
            calculationText = `\n💡 Môn này bạn chưa nhập điểm quá trình. Hãy vào tab "Dự toán Điểm thi" để nhập các cột điểm thành phần và tính chính xác số điểm cần đạt nhé!`;
          }

          response = `📚 **Phân tích chiến lược môn ${mentionedCourse.code} - ${mentionedCourse.name}**:
- Số tín chỉ: **${mentionedCourse.credits} TC**.
- Tình trạng: ${mentionedCourse.status === 'completed' ? `Đã hoàn thành với điểm tổng kết ${cGrade.finalScore10?.toFixed(1)}.` : 'Đang học.'}${calculationText}`;
        } 
        // C. KỊCH BẢN: "HỌC CẢI THIỆN"
        else if (normalizedQuery.includes("cai thien") || normalizedQuery.includes("hoc lai") || normalizedQuery.includes("keo diem")) {
          if (improvementCourses.length > 0) {
            response = `🔄 **Chẩn đoán các môn học cải thiện sinh lời GPA cao nhất**:
Hiện tại bạn có ${improvementCourses.length} môn dưới điểm B. Nếu bạn đăng ký học lại và đạt điểm A, đây là mức tăng GPA thực tế bạn sẽ nhận được:
${improvementCourses.slice(0, 3).map((item, idx) => 
  `**${idx + 1}. ${item!.course.code} (${item!.course.credits} TC)**: Điểm cũ ${item!.score10.toFixed(1)} -> Kéo tổng GPA toàn khóa tăng **+${item!.deltaGpa.toFixed(3)} điểm**.`
).join('\n')}

💡 *Tư vấn*: Hãy ưu tiên môn **${improvementCourses[0]!.course.code}** vì nó mang lại sức bật lớn nhất cho GPA chung của bạn!`;
          } else {
            response = `🎉 Chúc mừng! Bảng điểm của bạn rất vững chắc. Tất cả các môn tính GPA đều đang ở mức Khá Giỏi trở lên, không có môn nào dưới B (3.0) đáng để bỏ thời gian học cải thiện lúc này.`;
          }
        } 
        // D. KỊCH BẢN "MÔ PHỎNG ĐIỂM (WHAT-IF)"
        else if (normalizedQuery.includes("gia dinh") || normalizedQuery.includes("ky nay") || normalizedQuery.includes("mo phong")) {
          const inProgCredits = inProgressCourses.reduce((sum, c) => sum + c.credits, 0);
          if (inProgCredits === 0) {
            response = `Hiện tại bạn không có môn học nào đang diễn ra để mô phỏng điểm số kỳ này.`;
          } else {
            const currentTotalPts = overall.gpa4 * currentTotalCredits;
            const newTotalCredits = currentTotalCredits + inProgCredits;
            const simBPlusGpa = (currentTotalPts + (inProgCredits * 3.5)) / newTotalCredits;
            const simAGpa = (currentTotalPts + (inProgCredits * 4.0)) / newTotalCredits;

            response = `🔮 **Mô phỏng "What-if" cho học kỳ hiện tại**:
Bạn đang có **${inProgCredits} TC** tính điểm kỳ này.
- Hiện tại GPA tích lũy: **${overall.gpa4.toFixed(2)}** (Hệ 4).
- Nếu kỳ này các môn đều đạt Khá Giỏi (B+ / 3.5): GPA tích lũy sẽ là **${simBPlusGpa.toFixed(2)}**.
- Nếu kỳ này bạn bứt phá đạt toàn A (4.0): GPA tích lũy sẽ nhảy vọt lên **${simAGpa.toFixed(2)}**!
💪 Hãy cố gắng cày cuốc các bài tập nhóm và giữa kỳ để tạo đà nhé!`;
          }
        }
        // E. KỊCH BẢN: PHÂN BỔ THỜI GIAN
        else if (normalizedQuery.includes("on thi") || normalizedQuery.includes("phan bo") || normalizedQuery.includes("thoi gian")) {
          if (studyPriorities.length === 0) {
            response = `Bạn hiện không có môn nào đang học cần ôn thi. Hãy kiểm tra lại danh sách môn học của kỳ này.`;
          } else {
            response = `📚 **Bảng phân bổ thời gian ôn thi dựa trên trọng số & tín chỉ**:
${studyPriorities.map((item, idx) => {
  const percent = totalPrioritySum > 0 ? Math.round((item.priorityScore / totalPrioritySum) * 100) : 0;
  return `• **Ưu tiên ${idx + 1}**: ${item.course.code} (${item.course.credits} TC, thi ${item.examWeight}%): dành **${percent}%** quỹ giờ.`;
}).join('\n')}

💡 *Chiến thuật*: Trọng số thi cuối kỳ của các môn này khá cao. Bạn nên lập kế hoạch ôn sớm cho **${studyPriorities[0].course.code}** ngay từ tuần này.`;
          }
        }
        // F. KỊCH BẢN MẶC ĐỊNH
        else {
          response = `💡 **Cố vấn học tập UniPlan phản hồi**:
Với **${overall.gpa4.toFixed(2)}/4.00** điểm tích lũy hiện có, bạn đang giữ phong độ rất tốt.
Bạn có thể hỏi tôi các câu như:
- *"Kiểm tra deadline khẩn cấp giúp tôi"*
- *"Môn COMP1016 cần thi mấy điểm để đạt mục tiêu?"*
- *"Có môn nào đáng để học cải thiện không?"*
- Hoặc gõ trực tiếp **mã môn học** để xem phân tích chi tiết!`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: response,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/40">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">UniPlan Academic Advisor</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Phân Tích Dữ Liệu
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Chẩn đoán học bạ bằng thuật toán và tối ưu hóa chiến lược
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

        {/* Body 2 Columns: Left is Smart Diagnostics, Right is Chat */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column: Diagnostics (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-slate-950/40">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Chẩn Đoán Học Lực Toàn Diện</span>
            </h3>

            {/* GPA Health Metric */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Trạng Thái Tích Lũy</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white font-mono">
                  {overall.gpa4.toFixed(2)} / 4.00
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {overall.honor.title.split(' ')[0]}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, (overall.gpa4 / 4.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Exam Priority Matrix */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-cyan-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Phân bổ thời gian ôn thi đề xuất:</span>
              </span>

              <div className="space-y-2">
                {studyPriorities.slice(0, 4).map((item, index) => {
                  const percent = totalPrioritySum > 0 ? Math.round((item.priorityScore / totalPrioritySum) * 100) : 25;
                  return (
                    <div 
                      key={item.course.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-400">{item.course.code}</span>
                          <span className="text-[10px] text-slate-400">({item.course.credits} TC)</span>
                        </div>
                        <p className="text-slate-300 font-medium truncate mt-0.5">
                          {item.course.name}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {percent}% Quỹ giờ
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenCalculatorForCourse(item.course.id);
                          }}
                          className="block text-[10px] text-blue-400 hover:text-blue-300 mt-1 cursor-pointer font-medium"
                        >
                          Dự toán thi →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Gánh Team */}
            {topCourses.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Các môn "gánh team" GPA:</span>
                </span>
                <div className="space-y-1 text-slate-300">
                  {topCourses.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-[11px]">
                      <span className="truncate pr-2">{c.code} - {c.name}</span>
                      <strong className="text-emerald-400 font-mono">
                        {calculateCourseGrade(c).finalScore10?.toFixed(1)} 
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Rule-based Chat Counselor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-[520px] bg-slate-900">
            
            {/* Quick Suggestion Chips */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex-shrink-0">Gợi ý:</span>
              {[
                'Kiểm tra deadline khẩn cấp',
                'Mô phỏng điểm học kỳ này',
                'COMP1016 cần thi mấy điểm?',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 whitespace-nowrap border border-slate-700 transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-md space-y-1'
                    }`}
                  >
                    <div className="whitespace-pre-line">
                      {msg.text}
                    </div>
                    <span className={`block text-[10px] text-right mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl rounded-tl-sm p-3 text-xs flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    <span>Đang chẩn đoán dữ liệu bảng điểm & deadline...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Gõ mã môn (COMP1016), hoặc hỏi về deadline..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!customQuestion.trim() || isThinking}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition cursor-pointer flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};