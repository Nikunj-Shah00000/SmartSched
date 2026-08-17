import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "Redstone & Slingshot School OS" });
});

// AI Document Reader ("The Crafting Table Extractor") API Route
app.post("/api/extract-form", async (req, res) => {
  try {
    const { imageBase64, formType, documentText } = req.body;

    const systemInstruction = `You are the "Crafting Table Vision Engine," an enterprise-grade AI Document Reader built into an all-in-one School Management System. Your primary job is to extract unstructured data from physical paper forms (images/PDFs/text) into structured JSON data.

Maintain an underlying theme metaphor:
- Minecraft: Processing is "Crafting items from raw blocks."
- Angry Birds: Extracted bottlenecks or missing data are "TNT Blockers," and successful extraction triggers a "DIRECT_HIT" status.

SYSTEM EXECUTION RULES:
1. Document Classification ("Block Detection"):
Automatically detect the input document type into one of four strictly enforced categories:
- ADMISSION_FORM
- REPORT_CARD
- FEE_RECEIPT
- LEAVE_LETTER
If the input does not match these, set classification to UNKNOWN.

2. Multi-Language & Translation Support ("Universal Decoder"):
- Read documents written in English or regional languages (e.g., Hindi, Tamil, Telugu, Marathi, Spanish, French, Bengali).
- Preserve original text in student_name.raw.
- Standardize all extracted JSON values into English under student_name.english and key_attributes.

3. Voice Review Script Generation ("Redstone Announcer"):
Generate a concise, human-friendly TTS (Text-to-Speech) script under 40 words summarizing the key fields and flagging missing items or low-confidence values.

EXTRACTION SCHEMAS BY DOCUMENT TYPE:
1. ADMISSION_FORM: Student Name, DOB, Grade/Class Applying For, Guardian Name, Contact Number, Address, Previous School.
2. REPORT_CARD: Student Name, Roll No, Academic Year, Term/Semester, Subject Marks/Grades List, Total Percentage/GPA, Teacher Comments.
3. FEE_RECEIPT: Receipt Number, Student Name, Class, Payment Date, Total Amount Paid, Payment Method (Cash/UPI/Card), Outstanding Balance.
4. LEAVE_LETTER: Student Name, Class/Section, Reason for Leave, Start Date, End Date, Total Days, Guardian Signature Present (true/false).

ERRORS & CONSTRAINTS:
- Do not invent data. If a field is smudged, torn, or unreadable, mark as null and add to flagged_fields.
- Set theme_status to "DIRECT_HIT" if is_ready_for_database is true with high confidence, "NEEDS_REDSTONE_REPAIR" if flagged_fields exist, or "TNT_WARNING" if critical fields are missing.`;

    const prompt = `Analyze this school document (${formType || "Auto-Detect"}) and extract structured JSON according to the Crafting Table Vision Engine specification.
Document text / context: ${documentText || "Scan image attached."}`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        document_metadata: {
          type: Type.OBJECT,
          properties: {
            detected_type: { type: Type.STRING, description: "ADMISSION_FORM | REPORT_CARD | FEE_RECEIPT | LEAVE_LETTER | UNKNOWN" },
            detected_language: { type: Type.STRING, description: "Language Name e.g. Hindi, English, Spanish" },
            confidence_score: { type: Type.NUMBER, description: "0.0 to 1.0 confidence score" },
            theme_status: { type: Type.STRING, description: "DIRECT_HIT | NEEDS_REDSTONE_REPAIR | TNT_WARNING" },
          },
          required: ["detected_type", "detected_language", "confidence_score", "theme_status"],
        },
        extracted_data: {
          type: Type.OBJECT,
          properties: {
            student_name: {
              type: Type.OBJECT,
              properties: {
                raw: { type: Type.STRING, description: "Original language student name" },
                english: { type: Type.STRING, description: "English translated student name" },
              },
              required: ["raw", "english"],
            },
            student_id: { type: Type.STRING, description: "Extracted Roll Number, Receipt #, or Student ID" },
            document_date: { type: Type.STRING, description: "YYYY-MM-DD or raw string" },
            key_attributes: {
              type: Type.OBJECT,
              description: "Extracted document specific key-value pairs in English",
            },
          },
          required: ["student_name"],
        },
        review_and_validation: {
          type: Type.OBJECT,
          properties: {
            flagged_fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field_name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["field_name", "reason"],
              },
            },
            is_ready_for_database: { type: Type.BOOLEAN },
          },
          required: ["is_ready_for_database"],
        },
        voice_confirmation_script: {
          type: Type.STRING,
          description: "A natural 2-sentence summary under 40 words formatted for Text-To-Speech audio readback.",
        },
      },
      required: ["document_metadata", "extracted_data", "review_and_validation", "voice_confirmation_script"],
    };

    let contents: any = prompt;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      };
    } else if (documentText) {
      contents = `${prompt}\n\nDocument Text Content:\n${documentText}`;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback mock response conforming strictly to the requested JSON schema
      const isLeave = formType?.includes("LEAVE") || documentText?.toLowerCase().includes("leave");
      const isReceipt = formType?.includes("FEE") || documentText?.toLowerCase().includes("receipt");
      const isReport = formType?.includes("REPORT") || documentText?.toLowerCase().includes("marks");

      let mockData: any;

      if (isLeave) {
        mockData = {
          document_metadata: {
            detected_type: "LEAVE_LETTER",
            detected_language: "Spanish",
            confidence_score: 0.96,
            theme_status: "DIRECT_HIT",
          },
          extracted_data: {
            student_name: {
              raw: "Mateo Garcia",
              english: "Mateo Garcia",
            },
            student_id: "STU-8821",
            document_date: "2026-07-28",
            key_attributes: {
              class_section: "Grade 10-A",
              reason_for_leave: "Severe fever and medical doctor checkup",
              start_date: "2026-07-28",
              end_date: "2026-07-30",
              total_days: "3 Days",
              guardian_signature_present: true,
            },
          },
          review_and_validation: {
            flagged_fields: [],
            is_ready_for_database: true,
          },
          voice_confirmation_script: "Processed a Leave Letter for Mateo Garcia in Spanish for 3 medical days. All guardian signatures are verified. Say Confirm to save to database.",
        };
      } else if (isReceipt) {
        mockData = {
          document_metadata: {
            detected_type: "FEE_RECEIPT",
            detected_language: "English",
            confidence_score: 0.99,
            theme_status: "DIRECT_HIT",
          },
          extracted_data: {
            student_name: {
              raw: "Steve Block",
              english: "Steve Block",
            },
            student_id: "REC-2026-904",
            document_date: "2026-07-25",
            key_attributes: {
              receipt_number: "REC-2026-904",
              class: "Grade 8-A",
              total_amount_paid: "$450.00",
              payment_method: "UPI / Digital Transfer",
              outstanding_balance: "$0.00",
            },
          },
          review_and_validation: {
            flagged_fields: [],
            is_ready_for_database: true,
          },
          voice_confirmation_script: "Processed a Fee Receipt of $450 for Steve Block in Grade 8-A. Outstanding balance is zero. Say Confirm to post to accounting.",
        };
      } else if (isReport) {
        mockData = {
          document_metadata: {
            detected_type: "REPORT_CARD",
            detected_language: "Marathi",
            confidence_score: 0.94,
            theme_status: "NEEDS_REDSTONE_REPAIR",
          },
          extracted_data: {
            student_name: {
              raw: "आदित्य कुलकर्णी",
              english: "Aditya Kulkarni",
            },
            student_id: "ROLL-42",
            document_date: "2026-07-15",
            key_attributes: {
              academic_year: "2025-2026",
              term: "Term 1 Final",
              math_grade: "A+ (94%)",
              science_grade: "A (88%)",
              english_grade: "B+ (79%)",
              total_percentage: "87.0%",
              teacher_comments: "Excellent logical problem solving in Redstone physics.",
            },
          },
          review_and_validation: {
            flagged_fields: [
              {
                field_name: "parent_signature",
                reason: "Bottom signature block is partially smudged on scanned page 2.",
              },
            ],
            is_ready_for_database: false,
          },
          voice_confirmation_script: "Processed a Report Card for Aditya Kulkarni in Marathi with 87 percent GPA. Note that the parent signature is smudged. Say Edit to adjust or Save to proceed.",
        };
      } else {
        // Default Admission Form in Hindi
        mockData = {
          document_metadata: {
            detected_type: "ADMISSION_FORM",
            detected_language: "Hindi",
            confidence_score: 0.97,
            theme_status: "DIRECT_HIT",
          },
          extracted_data: {
            student_name: {
              raw: "राहुल शर्मा",
              english: "Rahul Sharma",
            },
            student_id: "ADM-2026-104",
            document_date: "2026-07-27",
            key_attributes: {
              dob: "2011-04-12",
              grade_applying_for: "Grade 10-B",
              guardian_name: "Ramesh Sharma",
              contact_number: "+91 98765 43210",
              address: "Sector 14, Redstone Enclave, New Delhi",
              previous_school: "St. Xavier Crafting Academy",
            },
          },
          review_and_validation: {
            flagged_fields: [],
            is_ready_for_database: true,
          },
          voice_confirmation_script: "Processed an Admission Form for Rahul Sharma in Hindi. All required fields are extracted with Grade 10-B placement. Say Confirm to save, or Edit to fix.",
        };
      }

      return res.json(mockData);
    }

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const parsedJson = JSON.parse(result.text || "{}");
    res.json(parsedJson);
  } catch (error: any) {
    console.error("Crafting Table Extractor error:", error);
    res.status(500).json({
      error: "Failed to craft document record",
      message: error?.message || "Unknown error",
    });
  }
});

// Start Server with Vite Middleware
app.post("/api/scheduler", async (req, res) => {
  try {
    const { gradeLevel, absentTeacherId } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        schedule_metadata: {
          status: absentTeacherId ? "RE_ROUTED_SUCCESSFULLY" : "CIRCUIT_STABLE",
          grade_level: gradeLevel || "Class 10-A",
          generation_timestamp: new Date().toISOString(),
          total_conflicts_resolved: absentTeacherId ? 1 : 0,
        },
        teacher_workload_metrics: [
          {
            teacher_id: "T-101",
            teacher_name: "Prof. Alan Smith",
            periods_assigned_today: 4,
            max_daily_limit: 5,
            fatigue_status: "OPTIMAL",
          },
          {
            teacher_id: "T-102",
            teacher_name: "Dr. Sarah Connor",
            periods_assigned_today: absentTeacherId ? 0 : 5,
            max_daily_limit: 5,
            fatigue_status: absentTeacherId ? "OPTIMAL" : "NEAR_OVERLOAD",
          },
          {
            teacher_id: "T-204",
            teacher_name: "Prof. Mark Wood",
            periods_assigned_today: absentTeacherId ? 3 : 2,
            max_daily_limit: 5,
            fatigue_status: "OPTIMAL",
          },
        ],
        timetable_grid: [
          {
            period_number: 1,
            time_slot: "08:30 AM - 09:15 AM",
            subject: "Physics Practical",
            assigned_teacher: "Prof. Alan Smith",
            room_assigned: "Physics Lab 2",
            is_lab_required: true,
            is_substitute: false,
          },
          {
            period_number: 2,
            time_slot: "09:20 AM - 10:05 AM",
            subject: "Chemistry Lab",
            assigned_teacher: "Prof. Elena Vance",
            room_assigned: "Chem Lab 1",
            is_lab_required: true,
            is_substitute: false,
          },
          {
            period_number: 3,
            time_slot: "10:10 AM - 10:55 AM",
            subject: "Mathematics",
            assigned_teacher: absentTeacherId ? "Prof. Mark Wood" : "Dr. Sarah Connor",
            room_assigned: "Room 102",
            is_lab_required: false,
            is_substitute: !!absentTeacherId,
          },
          {
            period_number: 4,
            time_slot: "11:15 AM - 12:00 PM",
            subject: "Computer Science",
            assigned_teacher: "Prof. Kevin Flynn",
            room_assigned: "CS Lab 3",
            is_lab_required: true,
            is_substitute: false,
          },
        ],
        slingshot_re_route_log: absentTeacherId
          ? [
              {
                absent_teacher: "Dr. Sarah Connor",
                affected_period: 3,
                subject: "Mathematics",
                assigned_substitute: "Prof. Mark Wood",
                reason: "Mark Wood had 2 free periods and holds Math qualification.",
              },
            ]
          : [],
      });
    }

    const systemInstruction = `You are the "Redstone Scheduler Engine," an algorithmic AI constraint-solver for school timetables.
Construct, evaluate, and dynamically adjust conflict-free class schedules based on hard constraints (Zero Collisions), soft constraints (Workload Balancing <=5 periods, fatigue break), specialized room reservations (Labs), and instant absentee re-routing.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate an optimal timetable and workload analysis for ${gradeLevel || "Grade 10-A"}. Absent teacher ID: ${absentTeacherId || "None"}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json(JSON.parse(result.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: "Scheduler engine error", message: err.message });
  }
});

// Obsidian Database Core API
app.post("/api/database", async (req, res) => {
  try {
    const { role = "SUPER_ADMIN", query = "", studentId = "STU-8821" } = req.body;

    // RBAC Permissions check
    const isAllowed = role === "SUPER_ADMIN" || role === "ACADEMIC_ADMIN" || role === "FINANCE_OFFICER" || role === "TEACHER";

    return res.json({
      transaction_metadata: {
        status: isAllowed ? "OBSIDIAN_SYNC_COMPLETE" : "ACCESS_DENIED_BY_SHIELD",
        timestamp: new Date().toISOString(),
        requesting_user_id: "USR-409",
        requesting_role: role,
        permission_granted: isAllowed,
      },
      unified_student_profile: {
        student_id: studentId,
        full_name: "Aarav Verma",
        grade_section: "10-B",
        attendance_summary: {
          total_days: 120,
          days_present: 114,
          attendance_percentage: 95.0,
          health_bar_status: "MAX_HEALTH",
        },
        financial_ledger: role === "TEACHER" ? null : {
          total_annual_fee: 5000,
          amount_paid: 3500,
          outstanding_balance: 1500,
          fee_status: "PARTIAL_TNT_DUE",
        },
        academic_performance: [
          {
            term: "Mid-Term 2026",
            subject: "Mathematics",
            marks_obtained: 92,
            max_marks: 100,
            grade: "A+",
          },
          {
            term: "Mid-Term 2026",
            subject: "Physics Practical",
            marks_obtained: 88,
            max_marks: 100,
            grade: "A",
          },
        ],
      },
      digital_archive_search: {
        query: query || `${studentId} Fee Receipt & Health Pass`,
        total_matches: 2,
        matched_documents: [
          {
            document_id: "DOC-99411",
            file_type: "FEE_RECEIPT",
            upload_date: "2026-04-15",
            relevance_score: 0.98,
            storage_url: "https://vault.school.edu/docs/DOC-99411.pdf",
          },
          {
            document_id: "DOC-99412",
            file_type: "ADMISSION_FORM",
            upload_date: "2026-01-10",
            relevance_score: 0.91,
            storage_url: "https://vault.school.edu/docs/DOC-99412.pdf",
          },
        ],
      },
      reactive_sync_payload: {
        affected_modules: ["FEES", "ADMIN_DASHBOARD"],
        broadcast_event: "FEE_PAYMENT_RECORDED",
        ui_toast_message: "BOOM! Fee receipt indexed and balance auto-updated!",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Database core error", message: err.message });
  }
});

// Slingshot Command Center API
app.post("/api/command-center", async (req, res) => {
  try {
    const { searchQuery } = req.body;

    return res.json({
      dashboard_summary: {
        system_health: "BEDROCK_SECURE",
        active_tnt_alerts: 2,
        total_students_present_today: 842,
        attendance_rate_percentage: 94.2,
      },
      predictive_alerts: [
        {
          alert_id: "ALT-901",
          priority: "URGENT_TNT",
          category: "LOW_ATTENDANCE",
          title: "3-Day Consecutive Absence Detected",
          description: "Student Rohan Gupta (Grade 9-A) has been absent since Friday.",
          predictive_risk: "High dropout or unexcused medical leave risk if unaddressed.",
          slingshot_action: "TRIGGER_PARENT_CALL",
          target_id: "STU-1049",
        },
        {
          alert_id: "ALT-902",
          priority: "STONE_BLOCK",
          category: "STAFFING_SHORTAGE",
          title: "Teacher Workload Limit Warning",
          description: "Math Department capacity at 91% workload limit.",
          predictive_risk: "Potential teacher fatigue and substitute shortage.",
          slingshot_action: "AUTO_ASSIGN_SUBSTITUTE",
          target_id: "DEPT-MATH",
        },
      ],
      natural_language_query_response: {
        original_query: searchQuery || "Show students absent for three consecutive days.",
        parsed_filter: {
          entity: "STUDENT",
          conditions: [
            { field: "consecutive_absent_days", operator: ">=", value: 3 },
          ],
        },
        matching_count: 4,
        results_preview: [
          {
            student_id: "STU-1049",
            name: "Rohan Gupta",
            grade: "9-A",
            consecutive_absent_days: 3,
          },
          {
            student_id: "STU-1052",
            name: "Priya Das",
            grade: "10-C",
            consecutive_absent_days: 4,
          },
        ],
      },
      analytics_charts: {
        attendance_trend: [
          { day: "Mon", rate: 96.1 },
          { day: "Tue", rate: 95.4 },
          { day: "Wed", rate: 94.2 },
          { day: "Thu", rate: 95.8 },
          { day: "Fri", rate: 93.1 },
        ],
        fee_collection_status: {
          collected_percentage: 78.5,
          pending_percentage: 21.5,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Command center error", message: err.message });
  }
});

// Spawn Rate Analytics API
app.get("/api/spawn-analytics", async (req, res) => {
  try {
    return res.json({
      analytics_metadata: {
        engine_status: "SPAWN_RATE_BALANCED",
        forecast_period: "Q3 2026",
        confidence_score: 0.92,
      },
      shortage_predictions: [
        {
          department: "Science & Physics",
          predicted_risk_date_range: "2026-11-10 to 2026-11-20",
          risk_factor: "Historical Flu Season Leave Spike",
          shortage_probability: 0.84,
          recommended_action: "PRE_BOOK_SUBSTITUTE_POOL",
        },
      ],
      substitute_recommendation: {
        absent_teacher: "Dr. Sarah Connor (Physics)",
        top_matches: [
          {
            teacher_id: "T-204",
            name: "Prof. Mark Wood",
            match_score: 0.96,
            current_daily_periods: 2,
            qualification_match: true,
          },
        ],
      },
      department_workload_health: [
        {
          department_name: "Mathematics",
          average_daily_periods_per_teacher: 5.2,
          capacity_utilization_percent: 91.0,
          status: "OVERLOADED_TNT",
          slingshot_recommendation: "Assign 1 floating T.A. to relieve paper grading.",
        },
        {
          department_name: "Sciences",
          average_daily_periods_per_teacher: 4.1,
          capacity_utilization_percent: 78.0,
          status: "OPTIMAL",
          slingshot_recommendation: "Maintain current schedule.",
        },
      ],
      next_year_hiring_forecast: {
        projected_enrollment_growth_percent: 12.5,
        recruitment_priorities: [
          {
            subject: "Computer Science & Robotics",
            current_staff_count: 3,
            required_staff_count: 5,
            hire_urgency: "HIGH_PRIORITY",
          },
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Spawn analytics error", message: err.message });
  }
});

// X-Ray Scanner & Pressure Plate Attendance API
app.post("/api/attendance-scan", async (req, res) => {
  try {
    const { scanType = "FACE_RECOGNITION", studentId = "STU-8821" } = req.body;

    return res.json({
      attendance_event: {
        status: "HEALTH_BAR_INCREMENTED",
        verification_method: scanType,
        timestamp: new Date().toISOString(),
      },
      student_details: {
        student_id: studentId,
        name: "Aarav Verma",
        grade_section: "10-B",
        confidence_score: 0.96,
        current_health_bar_percent: 98.0,
      },
      spatial_heatmap_data: [
        {
          zone_id: "ZONE_BLOCK_A",
          zone_name: "Senior High Wing (Grades 9-12)",
          total_capacity: 300,
          current_present_count: 284,
          attendance_density_percent: 94.6,
          heatmap_color_code: "#5B8731",
        },
        {
          zone_id: "ZONE_LAB_WING",
          zone_name: "Science Laboratories",
          total_capacity: 60,
          current_present_count: 42,
          attendance_density_percent: 70.0,
          heatmap_color_code: "#FF5500",
        },
      ],
      trend_analytics: {
        flagged_trend: "FRIDAY_AFTERNOON_DIP",
        insight_description: "Class 10-B attendance drops by 14% on Friday Period 6 (Physics Lab).",
        suggested_admin_action: "SLINGSHOT_PARENTS_ALERT",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Attendance scan error", message: err.message });
  }
});

// Master Operations & AI Assistant Core API
app.post("/api/master-assistant", async (req, res) => {
  try {
    const { query = "Which classrooms are free right now?" } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        system_status: {
          engine_mode: "VOXEL_TWIN_ACTIVE",
          timestamp: new Date().toISOString(),
        },
        chatbot_response: {
          user_query: query,
          natural_reply: `Currently processing query "${query}". All system channels are bedrock secure with 4 open classrooms and zero critical conflicts.`,
          queried_data: [
            { room_id: "ROOM-102", building: "Block A", capacity: 40 },
            { room_id: "LAB-03", building: "Science Wing", capacity: 28 },
          ],
        },
        predictive_student_analytics: [
          {
            student_id: "STU-4022",
            name: "Dev Patel",
            grade: "8-C",
            risk_level: "CRITICAL_TNT_RISK",
            composite_risk_score: 0.78,
            breakdown: {
              attendance: "74% (Down 12% this month)",
              academics: "Math dropped from B to D",
              assignments_missing: 4,
              behavioral_flags: 1,
            },
            slingshot_intervention: "Schedule 1-on-1 counselor meeting & trigger automated parent alert.",
          },
        ],
        smart_fee_engine: {
          total_outstanding_amount: 14200.00,
          predicted_late_payers_count: 8,
          scholarship_matches: [
            {
              student_id: "STU-9912",
              student_name: "Priya Sharma",
              recommended_scholarship: "STEM Excellence Grant",
              match_confidence: 0.94,
            },
          ],
        },
        digital_school_twin: {
          campus_zones: [
            {
              zone_id: "BLOCK_A",
              active_occupancy_percent: 88,
              classrooms_free: 2,
              teacher_count_present: 14,
              energy_consumption_kw: 42.5,
            },
            {
              zone_id: "SCIENCE_WING",
              active_occupancy_percent: 72,
              classrooms_free: 2,
              teacher_count_present: 8,
              energy_consumption_kw: 31.0,
            },
          ],
        },
        generated_report_preview: {
          report_type: "GOVERNMENT_COMPLIANCE_ATTENDANCE",
          generation_status: "READY_FOR_EXPORT",
          download_format: "PDF",
        },
      });
    }

    const systemInstruction = `You are the "Master Operations & AI Assistant Core," an enterprise-grade intelligence engine powering an integrated School Management Platform. Answer administrative queries, provide predictive student risk analysis, fee insights, voxel school twin metrics, and report export schemas.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Query: ${query}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json(JSON.parse(result.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: "Master assistant error", message: err.message });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(` Redstone & Slingshot School OS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
