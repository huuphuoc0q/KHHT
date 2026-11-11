import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Printer,
  Sparkles
} from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';
import confetti from 'canvas-confetti';

interface ExportImportModalProps {
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ onClose }) => {
  const { 
    courses, 
    tasks, 
    semesters, 
    userProfile, 
    loadDemoData, 
    resetAllData, 
    importFullData 
  } = useUniPlanStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xuất file JSON
  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      semesters,
      courses,
      tasks,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UniPlan-Data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Nhập file JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = importFullData(parsed);
        if (success) {
          confetti({
            particleCount: 50,
            spread: 60,
          });
          alert('Khôi phục dữ liệu UniPlan thành công!');
          onClose();
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    if (confirm('Bạn có muốn nạp dữ liệu mẫu sinh viên đại học với 15+ môn học, thời khóa biểu và deadline?')) {
      loadDemoData();
      confetti({
        particleCount: 70,
        spread: 80,
      });
      onClose();
    }
  };

  const handleReset = () => {
    if (confirm('CẢNH BÁO: Tất cả môn học, điểm số và deadline sẽ bị xóa hoàn toàn. Bạn có chắc chắn không?')) {
      resetAllData();
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quản Lý &amp; Sao Lưu Dữ Liệu</h2>
              <p className="text-xs text-slate-400">
                Xuất file, phục hồi dữ liệu hoặc nạp dữ liệu đại học mẫu
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

        {/* Body Options */}
        <div className="p-5 space-y-4">
          
          {/* Export JSON Card */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Xuất File Sao Lưu (.JSON)
              </span>
              <p className="text-[11px] text-slate-400">
                Tải xuống toàn bộ bảng điểm, môn học, thời khóa biểu và deadline
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition cursor-pointer flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Tải file</span>
            </button>
          </div>

          {/* Import JSON Card */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Phục Hồi Dữ Liệu (.JSON)
              </span>
              <p className="text-[11px] text-slate-400">
                Khôi phục từ file sao lưu đã lưu trước đó trên máy
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer flex-shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn file</span>
              </button>
            </div>
          </div>

          {/* Load Sample Demo Data */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Nạp Dữ Liệu Mẫu Đại Học</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Tải sẵn 15+ môn học, bảng điểm đầy đủ các kỳ, lịch học &amp; deadline
              </p>
            </div>
            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold transition cursor-pointer flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nạp mẫu</span>
            </button>
          </div>

          {/* Print Report */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                In Báo Cáo Bảng Điểm &amp; Lịch Học
              </span>
              <p className="text-[11px] text-slate-400">
                Định dạng in ấn tối ưu chuẩn A4 để nộp hoặc lưu trữ
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer flex-shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>In trang</span>
            </button>
          </div>

          {/* Reset All Data */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-300 block">
                Xóa Toàn Bộ Dữ Liệu
              </span>
              <p className="text-[11px] text-slate-400">
                Xóa tất cả môn học, điểm số để bắt đầu từ trang trắng
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition cursor-pointer flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa sạch</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
