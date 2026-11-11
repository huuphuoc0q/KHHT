import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Printer, 
  BookOpen, 
  Calendar, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useUniPlanStore } from '../store/useUniPlanStore';
import { Course } from '../types';

export const ScheduleView: React.FC = () => {
  const { courses, activeSemesterId, semesters } = useUniPlanStore();

  const currentDayOfWeek = new Date().getDay() === 0 ? 8 : new Date().getDay() + 1; // 2 -> 8 (CN)
  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek);

  // Lọc các môn có lịch học trong học kỳ đang chọn (hoặc tất cả các môn đang học)
  const scheduledCourses = courses.filter((c) => {
    if (!c.schedule) return false;
    if (activeSemesterId !== 'ALL' && c.semester !== activeSemesterId) return false;
    return c.status === 'in-progress';
  });

  const days = [
    { dayNumber: 2, label: 'Thứ Hai', short: 'T2' },
    { dayNumber: 3, label: 'Thứ Ba', short: 'T3' },
    { dayNumber: 4, label: 'Thứ Tư', short: 'T4' },
    { dayNumber: 5, label: 'Thứ Năm', short: 'T5' },
    { dayNumber: 6, label: 'Thứ Sáu', short: 'T6' },
    { dayNumber: 7, label: 'Thứ Bảy', short: 'T7' },
    { dayNumber: 8, label: 'Chủ Nhật', short: 'CN' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Thời Khóa Biểu Tuần</h1>
            <p className="text-xs text-slate-400">
              Lịch học các môn trong học kỳ • Hôm nay là{' '}
              <strong className="text-cyan-300">
                {currentDayOfWeek === 8 ? 'Chủ Nhật' : `Thứ ${currentDayOfWeek}`}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs */}
      <div className="lg:hidden flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {days.map((d) => {
          const isSelected = selectedDay === d.dayNumber;
          const isToday = currentDayOfWeek === d.dayNumber;
          const classCount = scheduledCourses.filter(c => c.schedule?.dayOfWeek === d.dayNumber).length;

          return (
            <button
              key={d.dayNumber}
              onClick={() => setSelectedDay(d.dayNumber)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex flex-col items-center min-w-[70px] ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{d.short}</span>
              <span className="text-[10px] mt-0.5 opacity-80">
                {classCount > 0 ? `${classCount} tiết` : 'Trống'}
              </span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: Selected Day View */}
      <div className="lg:hidden space-y-3">
        {scheduledCourses.filter(c => c.schedule?.dayOfWeek === selectedDay).length > 0 ? (
          scheduledCourses
            .filter(c => c.schedule?.dayOfWeek === selectedDay)
            .map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2.5 h-12 rounded-full"
                    style={{ backgroundColor: c.color || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{c.code}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {c.credits} TC
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{c.name}</h3>
                    {c.instructor && <p className="text-xs text-slate-400">{c.instructor}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center space-x-1 text-xs font-bold text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
                    <Clock className="w-3 h-3" />
                    <span>{c.schedule?.timeSlot}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Phòng: <strong className="text-white">{c.schedule?.room}</strong></p>
                </div>
              </div>
            ))
        ) : (
          <div className="py-12 text-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-slate-400 text-xs">
            Ngày này không có lịch học
          </div>
        )}
      </div>

      {/* Desktop Full 7-Day Grid */}
      <div className="hidden lg:grid grid-cols-7 gap-3">
        {days.map((d) => {
          const isToday = currentDayOfWeek === d.dayNumber;
          const dayClasses = scheduledCourses.filter(c => c.schedule?.dayOfWeek === d.dayNumber);

          return (
            <div
              key={d.dayNumber}
              className={`rounded-2xl border flex flex-col min-h-[460px] overflow-hidden transition-all ${
                isToday
                  ? 'bg-slate-900/90 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Day Column Header */}
              <div className={`p-3 text-center border-b ${
                isToday 
                  ? 'bg-blue-600/20 border-blue-500/30 text-white' 
                  : 'bg-slate-800/40 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-xs font-bold">{d.label}</span>
                  {isToday && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                      Hôm nay
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {dayClasses.length} môn học
                </span>
              </div>

              {/* Day Classes List */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                {dayClasses.length > 0 ? (
                  dayClasses.map(c => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-blue-300">
                          {c.code}
                        </span>
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color || '#3b82f6' }}
                        />
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {c.name}
                      </h4>

                      <div className="pt-1 border-t border-slate-700/50 space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center space-x-1 text-cyan-300 font-semibold">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{c.schedule?.timeSlot}</span>
                        </div>
                        {c.schedule?.room && (
                          <div className="flex items-center space-x-1 text-slate-300">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-slate-500" />
                            <span>Phòng: {c.schedule.room}</span>
                          </div>
                        )}
                        {c.instructor && (
                          <div className="flex items-center space-x-1 text-slate-400 truncate">
                            <User className="w-3 h-3 flex-shrink-0 text-slate-500" />
                            <span className="truncate">{c.instructor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <span className="text-[11px] text-slate-600 italic">
                      Trống lịch
                    </span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
