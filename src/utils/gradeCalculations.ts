import { Course, GradeComponent, GradeScaleConversion } from '../types';

export const STANDARD_GRADE_SCALE: GradeScaleConversion[] = [
  { letter: 'A', system4: 4.0, minScore10: 8.5, rankName: 'Xuất sắc', badgeColor: 'bg-emerald-600 text-white' },
  { letter: 'B+', system4: 3.5, minScore10: 7.8, rankName: 'Giỏi', badgeColor: 'bg-blue-500 text-white' },
  { letter: 'B', system4: 3.0, minScore10: 7.0, rankName: 'Khá', badgeColor: 'bg-blue-600 text-white' },
  { letter: 'C+', system4: 2.5, minScore10: 6.3, rankName: 'Trung bình Khá', badgeColor: 'bg-amber-500 text-white' },
  { letter: 'C', system4: 2.0, minScore10: 5.5, rankName: 'Trung bình', badgeColor: 'bg-amber-600 text-white' },
  { letter: 'D+', system4: 1.5, minScore10: 4.8, rankName: 'Trung bình Yếu', badgeColor: 'bg-orange-500 text-white' },
  { letter: 'D', system4: 1.0, minScore10: 4.0, rankName: 'Yếu (Qua môn)', badgeColor: 'bg-orange-600 text-white' },
  { letter: 'F+', system4: 0.5, minScore10: 3.0, rankName: 'Yếu', badgeColor: 'bg-rose-500 text-white' },
  { letter: 'F', system4: 0.0, minScore10: 0.0, rankName: 'Kém (Học lại)', badgeColor: 'bg-rose-600 text-white' },
];

/**
 * Tính điểm hiệu dụng của 1 cột điểm thành phần.
 * Nếu có subGrades (điểm con), lấy trung bình các điểm con hợp lệ.
 * Nếu không, lấy component.score.
 */
export function getComponentScore(component: GradeComponent): number | null {
  if (component.subGrades && component.subGrades.length > 0) {
    const validSubGrades = component.subGrades.filter(sg => sg.score !== null && !isNaN(sg.score));
    if (validSubGrades.length === 0) return component.score;
    const sum = validSubGrades.reduce((acc, curr) => acc + (curr.score! * (10 / (curr.maxScore || 10))), 0);
    return Math.round((sum / validSubGrades.length) * 100) / 100;
  }
  return component.score;
}

/**
 * Tính toán tổng điểm hệ 10 của môn học:
 * - finalScore: điểm tổng kết nếu tất cả các cột đã có điểm
 * - currentProgressScore: điểm tích lũy hiện tại (tính trên các cột đã nhập điểm)
 * - totalWeight: tổng trọng số các cột
 * - enteredWeight: trọng số các cột đã có điểm
 * - isFullyGraded: đã có điểm đầy đủ hay chưa
 */
// Các học phần điều kiện (GDQP, GDTC) không tính vào GPA và 130 TC tích lũy
export const isConditionalCourse = (code: string): boolean => {
  const normalized = code.trim().toUpperCase();
  return normalized.startsWith('MILI') || normalized.startsWith('PHYL');
};
export function calculateCourseGrade(course: Course) {
  let accumulatedWeightedScore = 0;
  let enteredWeight = 0;
  let totalWeight = 0;
  let missingComponentsCount = 0;

  course.gradeComponents.forEach(comp => {
    totalWeight += comp.weight;
    const score = getComponentScore(comp);
    if (score !== null && !isNaN(score)) {
      accumulatedWeightedScore += (score * comp.weight) / 100;
      enteredWeight += comp.weight;
    } else {
      missingComponentsCount++;
    }
  });

  const isFullyGraded = totalWeight > 0 && enteredWeight >= totalWeight && missingComponentsCount === 0;

  // Điểm tổng kết hệ 10 (làm tròn 2 chữ số thập phân)
  const finalScore10 = isFullyGraded ? Math.round(accumulatedWeightedScore * 100) / 100 : null;

  // Điểm quy đổi tạm thời theo % trọng số đã hoàn thành (nếu chia trên enteredWeight)
  const currentAverage10 = enteredWeight > 0 
    ? Math.round((accumulatedWeightedScore / (enteredWeight / 100)) * 100) / 100 
    : null;

  const conversion = convertScoreToGrade(finalScore10 ?? currentAverage10 ?? 0);

  return {
    accumulatedWeightedScore: Math.round(accumulatedWeightedScore * 100) / 100,
    enteredWeight,
    totalWeight,
    missingComponentsCount,
    isFullyGraded,
    finalScore10,
    currentAverage10,
    conversion,
  };
}

/**
 * Quy đổi điểm hệ 10 sang Hệ 4, Điểm chữ và Xếp loại
 */
export function convertScoreToGrade(score10: number): GradeScaleConversion {
  const rounded = Math.round(score10 * 10) / 10;
  for (const scale of STANDARD_GRADE_SCALE) {
    if (rounded >= scale.minScore10) {
      return scale;
    }
  }
  return STANDARD_GRADE_SCALE[STANDARD_GRADE_SCALE.length - 1];
}

/**
 * Xếp loại tốt nghiệp theo GPA Hệ 4
 */
export function getGraduationHonor(gpa4: number): { title: string; color: string; desc: string } {
  if (gpa4 >= 3.6) {
    return { title: 'Xuất Sắc (Summa Cum Laude)', color: 'text-emerald-500', desc: 'GPA 3.60 - 4.00' };
  } else if (gpa4 >= 3.2) {
    return { title: 'Giỏi (Magna Cum Laude)', color: 'text-blue-500', desc: 'GPA 3.20 - 3.59' };
  } else if (gpa4 >= 2.5) {
    return { title: 'Khá', color: 'text-amber-500', desc: 'GPA 2.50 - 3.19' };
  } else if (gpa4 >= 2.0) {
    return { title: 'Trung Bình', color: 'text-orange-500', desc: 'GPA 2.00 - 2.49' };
  } else {
    return { title: 'Yếu / Chưa đạt', color: 'text-rose-500', desc: 'GPA < 2.00' };
  }
}

/**
 * Tính GPA cho một danh sách môn học (cho cả học kỳ hoặc toàn khóa)
 */
export function calculateGPA(courses: Course[]) {
  const gpaCourses = courses.filter((c) => !isConditionalCourse(c.code));
  let totalCredits = 0;
  let totalEarnedCredits = 0;
  let weightedScore10Sum = 0;
  let weightedScore4Sum = 0;

  gpaCourses.forEach(course => {
    // Chỉ tính các môn đã có điểm hoặc đang tính (nếu tính dự đoán)
    const { finalScore10, currentAverage10, isFullyGraded } = calculateCourseGrade(course);
    const score10ToUse = finalScore10 ?? (course.status === 'in-progress' ? currentAverage10 : null);

    if (score10ToUse !== null && course.credits > 0) {
      const conversion = convertScoreToGrade(score10ToUse);
      totalCredits += course.credits;
      
      // Nếu không bị rớt (F), được tính tín chỉ tích lũy
      if (conversion.letter !== 'F') {
        totalEarnedCredits += course.credits;
      }

      weightedScore10Sum += score10ToUse * course.credits;
      weightedScore4Sum += conversion.system4 * course.credits;
    }
  });

  const gpa10 = totalCredits > 0 ? Math.round((weightedScore10Sum / totalCredits) * 100) / 100 : 0;
  const gpa4 = totalCredits > 0 ? Math.round((weightedScore4Sum / totalCredits) * 100) / 100 : 0;

  return {
    totalCredits,
    totalEarnedCredits,
    gpa10,
    gpa4,
    honor: getGraduationHonor(gpa4),
  };
}

/**
 * Dự toán điểm thi cuối kỳ (hoặc cột điểm còn thiếu) cần đạt để đạt mục tiêu
 */
export interface TargetRequirementResult {
  targetLabel: string;
  targetScore10: number;
  letter: string;
  system4: number;
  requiredScore: number | null; // null nếu không khả thi
  isFeasible: boolean;          // true nếu requiredScore <= 10
  isAlreadyAchieved: boolean;   // true nếu điểm hiện tại đã đủ ngay cả khi thi 0 điểm
  statusText: string;
}

export function solveRequiredComponentScore(
  course: Course,
  targetScore10: number,
  targetComponentId?: string
): {
  requiredScore: number | null;
  isFeasible: boolean;
  isAlreadyAchieved: boolean;
  targetComponentName: string;
  targetWeight: number;
} {
  // Tìm component cần giải
  let targetComp: GradeComponent | undefined;
  if (targetComponentId) {
    targetComp = course.gradeComponents.find(c => c.id === targetComponentId);
  } else {
    // Tự động tìm component chưa có điểm hoặc có tên "cuối kỳ"
    targetComp = course.gradeComponents.find(c => {
      const s = getComponentScore(c);
      return s === null;
    }) || course.gradeComponents.find(c => /cuối|final|thi/i.test(c.name)) || course.gradeComponents[course.gradeComponents.length - 1];
  }

  if (!targetComp || targetComp.weight <= 0) {
    return {
      requiredScore: null,
      isFeasible: false,
      isAlreadyAchieved: false,
      targetComponentName: 'Chưa xác định',
      targetWeight: 0,
    };
  }

  // Tính tổng điểm đã có từ các component khác
  let otherComponentsWeightedSum = 0;
  course.gradeComponents.forEach(c => {
    if (c.id !== targetComp!.id) {
      const s = getComponentScore(c) ?? 0;
      otherComponentsWeightedSum += (s * c.weight) / 100;
    }
  });

  // Công thức: targetScore10 = otherComponentsWeightedSum + (requiredScore * targetComp.weight / 100)
  // => requiredScore = (targetScore10 - otherComponentsWeightedSum) / (targetComp.weight / 100)
  const targetWeightFraction = targetComp.weight / 100;
  const neededScore = (targetScore10 - otherComponentsWeightedSum) / targetWeightFraction;
  const roundedNeeded = Math.round(neededScore * 10) / 10;

  const isAlreadyAchieved = roundedNeeded <= 0;
  const isFeasible = roundedNeeded <= 10;
  const finalNeeded = isAlreadyAchieved ? 0 : isFeasible ? roundedNeeded : null;

  return {
    requiredScore: finalNeeded,
    isFeasible,
    isAlreadyAchieved,
    targetComponentName: targetComp.name,
    targetWeight: targetComp.weight,
  };
}

/**
 * Tính toán các mốc điểm chuẩn (A, B+, B, C+, C, D) cho môn học
 */
export function calculateAllGradeTargets(course: Course, targetComponentId?: string): TargetRequirementResult[] {
  const targets = [
    { label: 'Điểm A (Xuất sắc)', score: 8.5, letter: 'A', system4: 4.0 },
    { label: 'Điểm B+ (Giỏi)', score: 7.8, letter: 'B+', system4: 3.5 },
    { label: 'Điểm B (Khá)', score: 7.0, letter: 'B', system4: 3.0 },
    { label: 'Điểm C+ (TB Khá)', score: 6.3, letter: 'C+', system4: 2.5 },
    { label: 'Điểm C (Trung bình)', score: 5.5, letter: 'C', system4: 2.0 },
    { label: 'Điểm D (Qua môn)', score: 4.0, letter: 'D', system4: 1.0 },
  ];

  return targets.map(t => {
    const res = solveRequiredComponentScore(course, t.score, targetComponentId);
    let statusText = '';
    if (res.isAlreadyAchieved) {
      statusText = 'Đã nắm chắc (chỉ cần thi 0 điểm là đạt)';
    } else if (res.isFeasible && res.requiredScore !== null) {
      statusText = `Cần tối thiểu ${res.requiredScore.toFixed(1)} điểm`;
    } else {
      statusText = 'Không khả thi (vượt quá 10 điểm)';
    }

    return {
      targetLabel: t.label,
      targetScore10: t.score,
      letter: t.letter,
      system4: t.system4,
      requiredScore: res.requiredScore,
      isFeasible: res.isFeasible,
      isAlreadyAchieved: res.isAlreadyAchieved,
      statusText,
    };
  });
}
