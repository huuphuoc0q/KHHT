import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Course, 
  GradeComponent, 
  SubGrade, 
  Task, 
  UserProfile, 
  SemesterInfo, 
  ActiveTab 
} from '../types';
import { 
  INITIAL_USER_PROFILE, 
  INITIAL_SEMESTERS, 
  INITIAL_COURSES, 
  INITIAL_TASKS 
} from '../utils/demoData';

interface UniPlanState {
  userProfile: UserProfile;
  semesters: SemesterInfo[];
  courses: Course[];
  tasks: Task[];
  activeSemesterId: string; // 'ALL' hoặc id cụ thể
  activeTab: ActiveTab;

  // View state
  setActiveTab: (tab: ActiveTab) => void;
  setActiveSemesterId: (semesterId: string) => void;

  // User Profile
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Semesters
  addSemester: (semester: Omit<SemesterInfo, 'id'>) => void;
  deleteSemester: (id: string) => void;
  setCurrentSemester: (id: string) => void;

  // Courses
  addCourse: (course: Omit<Course, 'id'>) => string;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  duplicateCourse: (id: string) => void;

  // Grade Components
  addGradeComponent: (courseId: string, component: Omit<GradeComponent, 'id'>) => void;
  updateGradeComponent: (courseId: string, componentId: string, updates: Partial<GradeComponent>) => void;
  deleteGradeComponent: (courseId: string, componentId: string) => void;

  // SubGrades
  addSubGrade: (courseId: string, componentId: string, subGrade: Omit<SubGrade, 'id'>) => void;
  updateSubGrade: (courseId: string, componentId: string, subGradeId: string, updates: Partial<SubGrade>) => void;
  deleteSubGrade: (courseId: string, componentId: string, subGradeId: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Data management
  loadDemoData: () => void;
  resetAllData: () => void;
  importFullData: (data: { userProfile?: UserProfile; courses?: Course[]; tasks?: Task[]; semesters?: SemesterInfo[] }) => boolean;
}

export const useUniPlanStore = create<UniPlanState>()(
  persist(
    (set, get) => ({
      userProfile: INITIAL_USER_PROFILE,
      semesters: INITIAL_SEMESTERS,
      courses: INITIAL_COURSES,
      tasks: INITIAL_TASKS,
      activeSemesterId: 'HK2-2025-2026',
      activeTab: 'dashboard',

      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveSemesterId: (semesterId) => set({ activeSemesterId: semesterId }),

      updateUserProfile: (updates) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates },
        })),

      addSemester: (sem) => {
        const id = `HK-${Date.now()}`;
        set((state) => ({
          semesters: [...state.semesters, { ...sem, id }],
        }));
      },

      deleteSemester: (id) =>
        set((state) => ({
          semesters: state.semesters.filter((s) => s.id !== id),
          activeSemesterId: state.activeSemesterId === id ? 'ALL' : state.activeSemesterId,
        })),

      setCurrentSemester: (id) =>
        set((state) => ({
          semesters: state.semesters.map((s) => ({
            ...s,
            isCurrent: s.id === id,
          })),
          activeSemesterId: id,
        })),

      addCourse: (courseData) => {
        const id = `course-${Date.now()}`;
        const newCourse: Course = {
          ...courseData,
          id,
        };
        set((state) => ({
          courses: [newCourse, ...state.courses],
        }));
        return id;
      },

      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          tasks: state.tasks.filter((t) => t.courseId !== id),
        })),

      duplicateCourse: (id) => {
        const existing = get().courses.find((c) => c.id === id);
        if (!existing) return;
        const newId = `course-${Date.now()}`;
        const duplicated: Course = {
          ...existing,
          id: newId,
          code: `${existing.code}-COPY`,
          name: `${existing.name} (Bản sao)`,
          gradeComponents: existing.gradeComponents.map((gc) => ({
            ...gc,
            id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            subGrades: gc.subGrades.map((sg) => ({
              ...sg,
              id: `sg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            })),
          })),
        };
        set((state) => ({
          courses: [duplicated, ...state.courses],
        }));
      },

      addGradeComponent: (courseId, componentData) => {
        const compId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newComponent: GradeComponent = {
          ...componentData,
          id: compId,
          subGrades: componentData.subGrades || [],
        };
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              gradeComponents: [...c.gradeComponents, newComponent],
            };
          }),
        }));
      },

      updateGradeComponent: (courseId, componentId, updates) =>
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              gradeComponents: c.gradeComponents.map((gc) =>
                gc.id === componentId ? { ...gc, ...updates } : gc
              ),
            };
          }),
        })),

      deleteGradeComponent: (courseId, componentId) =>
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              gradeComponents: c.gradeComponents.filter((gc) => gc.id !== componentId),
            };
          }),
        })),

      addSubGrade: (courseId, componentId, subGradeData) => {
        const subId = `sg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newSubGrade: SubGrade = {
          ...subGradeData,
          id: subId,
        };
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              gradeComponents: c.gradeComponents.map((gc) => {
                if (gc.id !== componentId) return gc;
                return {
                  ...gc,
                  subGrades: [...gc.subGrades, newSubGrade],
                };
              }),
            };
          }),
        }));
      },

      updateSubGrade: (courseId, componentId, subGradeId, updates) =>
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              gradeComponents: c.gradeComponents.map((gc) => {
                if (gc.id !== componentId) return gc;
                return {
                  ...gc,
                  subGrades: gc.subGrades.map((sg) =>
                    sg.id === subGradeId ? { ...sg, ...updates } : sg
                  ),
                };
              }),
            };
          }),
        })),

      deleteSubGrade: (courseId, componentId, subGradeId) =>
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              gradeComponents: c.gradeComponents.map((gc) => {
                if (gc.id !== componentId) return gc;
                return {
                  ...gc,
                  subGrades: gc.subGrades.filter((sg) => sg.id !== subGradeId),
                };
              }),
            };
          }),
        })),

      addTask: (taskData) => {
        const id = `task-${Date.now()}`;
        set((state) => ({
          tasks: [{ ...taskData, id }, ...state.tasks],
        }));
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      toggleTaskStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t;
            const nextStatus: Task['status'] = t.status === 'done' ? 'todo' : 'done';
            return { ...t, status: nextStatus };
          }),
        })),

      loadDemoData: () =>
        set({
          userProfile: INITIAL_USER_PROFILE,
          semesters: INITIAL_SEMESTERS,
          courses: INITIAL_COURSES,
          tasks: INITIAL_TASKS,
          activeSemesterId: 'HK2-2025-2026',
        }),

      resetAllData: () =>
        set({
          courses: [],
          tasks: [],
          semesters: [
            { id: 'HK1-2025-2026', name: 'Học kỳ 1 (2025-2026)', academicYear: '2025-2026', isCurrent: true }
          ],
          activeSemesterId: 'HK1-2025-2026',
        }),

      importFullData: (data) => {
        try {
          set((state) => ({
            userProfile: data.userProfile || state.userProfile,
            courses: data.courses || state.courses,
            tasks: data.tasks || state.tasks,
            semesters: data.semesters || state.semesters,
          }));
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'uniplan-app-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
