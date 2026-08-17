export type AlertCategory = 'schedule' | 'paperwork' | 'staffing' | 'attendance';
export type Severity = 'critical' | 'warning' | 'info';

export interface CommandAlert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: Severity;
  location: string;
  xpReward: number;
  resolved: boolean;
  resolvedAt?: string;
  actionPrompt: string;
  targetHitCount?: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  period: number; // 1 to 6
  timeLabel: string;
  grade: string;
  subject: string;
  teacher: string;
  room: string;
  isConflict: boolean;
  conflictReason?: string;
  redstonePower: number; // 0 to 15
}

export interface CraftedDocumentData {
  document_metadata: {
    detected_type: 'ADMISSION_FORM' | 'REPORT_CARD' | 'FEE_RECEIPT' | 'LEAVE_LETTER' | 'UNKNOWN';
    detected_language: string;
    confidence_score: number;
    theme_status: 'DIRECT_HIT' | 'NEEDS_REDSTONE_REPAIR' | 'TNT_WARNING';
  };
  extracted_data: {
    student_name: {
      raw: string;
      english: string;
    };
    student_id?: string | null;
    document_date?: string | null;
    key_attributes: Record<string, any>;
  };
  review_and_validation: {
    flagged_fields: Array<{
      field_name: string;
      reason: string;
    }>;
    is_ready_for_database: boolean;
  };
  voice_confirmation_script: string;
}

export interface FormItem {
  id: string;
  title: string;
  type: string;
  language?: string;
  previewUrl?: string;
  rawSampleText?: string;
  status: 'unprocessed' | 'crafting' | 'crafted';
  extractedData?: CraftedDocumentData;
}

export interface AttendanceStudent {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  checkInTime?: string;
  pressurePlateZone: string;
  hearts: number; // 0 to 10 (representing 5 hearts with half heart precision)
  expLevel: number;
}

export interface DepartmentStaffing {
  department: string;
  iconName: string;
  activeTeachers: number;
  requiredTeachers: number;
  shortageProbability: number; // percentage
  peakDays: string[];
  suggestedSubs: string[];
}
