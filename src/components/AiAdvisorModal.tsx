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
import { calculateGPA, calculateCourseGrade, getComponentScore, convertScoreToGrade } from '../utils/gradeCalculations';

interface AiAdvisorModalProps {
  onClose: () => void;
  onOpenCalculatorForCourse: (courseId: string) => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ onClose, onOpenCalculatorForCourse }) => {
  const { courses, userProfile, activeSemesterId } = useUniPlanStore();

  const [customQuestion, setCustomQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Chào ${userProfile.studentName || 'bạn'}! Tôi là UniPlan AI - Cố vấn học tập tín chỉ của bạn. Tôi đã phân tích toàn bộ bảng điểm, tín chỉ và các môn đang học của bạn. Bạn muốn tư vấn về chiến lược thi cử, phân bổ thời gian ôn tập hay cách đạt bằng ${userProfile.targetCumulativeGpa4 >= 3.6 ? 'Xuất Sắc' : 'Giỏi'}?`,
      time: 'Vừa xong',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // 1. Phân tích điểm
  const overall = calculateGPA(courses);
  const inProgressCourses = courses.filter(c => c.status === 'in-progress');

  // 2. Môn gánh team (top điểm cao)
  const topCourses = [...courses]
    .filter(c => c.status === 'completed')
    .sort((a, b) => {
      const gA = calculateCourseGrade(a).finalScore10 || 0;
      const gB = calculateCourseGrade(b).finalScore10 || 0;
      return gB - gA;
    })
    .slice(0, 3);

  // 3. Môn kéo điểm (cần chú ý / học cải thiện)
  const weakCourses = [...courses]
    .filter(c => c.status === 'completed')
    .filter(c => {
      const g = calculateCourseGrade(c).finalScore10;
      return g !== null && g < 7.5;
    })
    .slice(0, 3);

  // 4. Ma trận ưu tiên ôn thi: Priority = Credits * ExamWeight
  const studyPriorities = inProgressCourses.map(c => {
    const finalComp = c.gradeComponents.find(comp => /cuối|final|thi/i.test(comp.name)) 
      || c.gradeComponents[c.gradeComponents.length - 1];
    const examWeight = finalComp ? finalComp.weight : 50;
    const priorityScore = c.credits * examWeight;
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

  // Xử lý gửi câu hỏi tư vấn AI
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

    // AI Academic Reasoning Generator
    setTimeout(() => {
      let response = '';

      if (/xuất sắc|giỏi|mục tiêu|bằng/i.test(query)) {
        response = `🎯 **Chiến lược giữ vững Bằng ${userProfile.targetCumulativeGpa4 >= 3.6 ? 'Xuất Sắc (GPA ≥ 3.6)' : 'Giỏi (GPA ≥ 3.2)'}**:
- Hiện tại GPA của bạn là **${overall.gpa4.toFixed(2)}/4.00** (${overall.honor.title.split(' ')[0]}).
- Để giữ vững hoặc chạm tới mục tiêu **${userProfile.targetCumulativeGpa4.toFixed(2)}**, trong học kỳ này bạn cần duy trì tối thiểu **${Math.max(3.2, userProfile.targetCumulativeGpa4).toFixed(2)}**.
- Trong ${inProgressCourses.length} môn đang học, hãy đặc biệt dồn sức vào các môn 3-4 tín chỉ (${inProgressCourses.map(c => c.code).join(', ')}). Một điểm A ở môn 4 tín chỉ có giá trị kéo GPA gấp đôi môn 2 tín chỉ!`;
      } else if (/ôn thi|phân bổ|thời gian|lịch/i.test(query)) {
        response = `📚 **Phân bổ thời gian ôn thi dựa trên trọng số tín chỉ**:
${studyPriorities.map((item, idx) => {
  const percent = totalPrioritySum > 0 ? Math.round((item.priorityScore / totalPrioritySum) * 100) : 25;
  return `• **Ưu tiên ${idx + 1}**: ${item.course.code} - ${item.course.name} (${item.course.credits} TC, thi ${item.examWeight}%): dành **${percent}%** quỹ thời gian ôn tập.`;
}).join('\n')}

💡 *Chiến thuật*: Hãy làm trước các đề thi mẫu của các năm trước và nắm vững các bài lab/bài tập lớn vì chúng chiếm 50% trọng số đề thi cuối kỳ.`;
      } else if (/cải thiện|học lại|kéo điểm/i.test(query)) {
        if (weakCourses.length > 0) {
          response = `🔄 **Gợi ý môn học cải thiện hiệu quả nhất**:
Bạn có các môn: ${weakCourses.map(c => `${c.code} (${calculateCourseGrade(c).finalScore10?.toFixed(1)})`).join(', ')}.
Nếu đăng ký học cải thiện 1 trong các môn này trong kỳ hè hoặc kỳ tới và nâng lên điểm A (8.5), GPA toàn khóa của bạn sẽ tăng ngay lập tức khoảng **+0.05 đến +0.10 điểm**!`;
        } else {
          response = `🎉 Bảng điểm của bạn rất đẹp! Hầu hết các môn đều đạt loại Khá Giỏi trở lên, không có môn nào dưới 7.0 cần học cải thiện gấp.`;
        }
      } else {
        response = `💡 **Phân tích học tập cho ${userProfile.studentName || 'bạn'}**:
- Tổng số tín chỉ đã hoàn thành: **${overall.totalEarnedCredits}/${userProfile.totalRequiredCredits} TC** (${Math.round((overall.totalEarnedCredits / userProfile.totalRequiredCredits) * 100)}%).
- Điểm quá trình kỳ này của bạn đang ở mức rất tốt (${studyPriorities[0]?.course.code || 'Môn học'}: TB ${studyPriorities[0]?.currentAvg?.toFixed(1) || '8.5'}).
- Bấm vào tab **"Dự toán Điểm thi"** ở thanh trên để xem chính xác điểm thi tối thiểu cần đạt cho từng môn nhé!`;
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
    }, 700);
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
                <h2 className="text-base font-bold text-white">UniPlan AI Academic Advisor</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Cố Vấn
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Chẩn đoán học bạ, tối ưu hóa điểm số và chiến lược học tập đại học
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
                {studyPriorities.map((item, index) => {
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
                        {calculateCourseGrade(c).finalScore10?.toFixed(1)} (A)
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: AI Chat Counselor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-[520px] bg-slate-900">
            
            {/* Quick Suggestion Chips */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex-shrink-0">Gợi ý:</span>
              {[
                'Làm sao để giữ bằng Xuất Sắc kỳ này?',
                'Phân bổ thời gian ôn thi tối ưu?',
                'Có nên học cải thiện môn nào không?',
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
                    <span>UniPlan AI đang phân tích dữ liệu bảng điểm...</span>
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
                  placeholder="Hỏi AI về chiến lược ôn thi, cách gỡ điểm môn học..."
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
