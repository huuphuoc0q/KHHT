import React, { useState } from 'react';
import { useUniPlanStore } from './store/useUniPlanStore';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CoursesView } from './components/CoursesView';
import { GradeCalculatorView } from './components/GradeCalculatorView';
import { ScheduleView } from './components/ScheduleView';
import { TasksView } from './components/TasksView';
import { GraduationPlannerView } from './components/GraduationPlannerView';
import { ProfileModal } from './components/ProfileModal';
import { ExportImportModal } from './components/ExportImportModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { CourseModal } from './components/CourseModal';
import { GraduationCap, Github, Heart } from 'lucide-react';

export default function App() {
  const { activeTab, setActiveTab } = useUniPlanStore();

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  // Selected course to focus in GradeCalculatorView
  const [calculatorCourseId, setCalculatorCourseId] = useState<string | null>(null);

  const handleOpenCalculatorForCourse = (courseId: string) => {
    setCalculatorCourseId(courseId);
    setActiveTab('calculator');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Global Header */}
      <Header
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenAddCourse={() => setIsAddCourseOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'courses' && (
          <CoursesView onOpenCalculatorForCourse={handleOpenCalculatorForCourse} />
        )}
        {activeTab === 'calculator' && (
          <GradeCalculatorView initialCourseId={calculatorCourseId} />
        )}
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'graduation' && <GraduationPlannerView />}
      </main>

      {/* Global Modals */}
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {isDataModalOpen && (
        <ExportImportModal onClose={() => setIsDataModalOpen(false)} />
      )}

      {isAiAdvisorOpen && (
        <AiAdvisorModal 
          onClose={() => setIsAiAdvisorOpen(false)} 
          onOpenCalculatorForCourse={handleOpenCalculatorForCourse}
        />
      )}

      {isAddCourseOpen && (
        <CourseModal onClose={() => setIsAddCourseOpen(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-slate-500 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-blue-600/30 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">UniPlan AI</span>
            <span>— Quản lý học tập &amp; Tính điểm tín chỉ đại học</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              ✓ Local Storage Persisted
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium">
              ✓ GitHub Pages &amp; Vercel Ready
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
