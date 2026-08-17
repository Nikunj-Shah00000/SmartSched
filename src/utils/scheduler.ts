import { TimetableSlot } from "../types";

export interface ConflictReport {
  initialConflicts: number;
  resolvedConflicts: number;
  unresolvedCount: number;
  resolvedSlots: TimetableSlot[];
  summaryLog: string[];
}

/**
 * Pure Algorithmic Redstone Conflict Resolver
 * Detects and auto-resolves room and teacher double-bookings across timetable matrix.
 */
export function resolveTimetableConflicts(slots: TimetableSlot[]): ConflictReport {
  const updatedSlots: TimetableSlot[] = slots.map((s) => ({ ...s }));
  const summaryLog: string[] = [];

  // Available substitute teachers and rooms pool
  const availableTeachers = [
    "Prof. Oak",
    "Dr. Minecraft",
    "Ms. Redstone",
    "Coach Steve",
    "Mr. TNT",
    "Mrs. Craft",
    "Dr. Feather",
    "Prof. Pig",
  ];

  const availableRooms = [
    "Room 101 (Grass Hall)",
    "Room 102 (Cobblestone)",
    "Room 201 (Redstone Lab)",
    "Room 202 (Crafting Deck)",
    "Gym 1 (Slingshot Arena)",
    "Lab 3 (Obsidian Vault)",
  ];

  // Step 1: Flag all active conflicts
  let conflictCount = 0;
  for (let i = 0; i < updatedSlots.length; i++) {
    const slotA = updatedSlots[i];
    let hasConflict = false;
    let reason = "";

    for (let j = 0; j < updatedSlots.length; j++) {
      if (i === j) continue;
      const slotB = updatedSlots[j];

      // Same Day and Same Period check
      if (slotA.day === slotB.day && slotA.period === slotB.period) {
        if (slotA.teacher === slotB.teacher) {
          hasConflict = true;
          reason = `Teacher Double-Booked: ${slotA.teacher} in ${slotA.room} & ${slotB.room}`;
          break;
        }
        if (slotA.room === slotB.room) {
          hasConflict = true;
          reason = `Room Collision: ${slotA.room} used by ${slotA.teacher} & ${slotB.teacher}`;
          break;
        }
      }
    }

    slotA.isConflict = hasConflict;
    if (hasConflict) {
      slotA.conflictReason = reason;
      conflictCount++;
    } else {
      slotA.conflictReason = undefined;
    }
  }

  const initialConflicts = conflictCount;
  let resolvedCount = 0;

  // Step 2: Auto-Resolve logic
  for (let i = 0; i < updatedSlots.length; i++) {
    const slot = updatedSlots[i];
    if (!slot.isConflict) continue;

    // Find used teachers and rooms for this specific (day, period)
    const usedTeachersInPeriod = new Set(
      updatedSlots
        .filter((s) => s.day === slot.day && s.period === slot.period && s.id !== slot.id)
        .map((s) => s.teacher)
    );

    const usedRoomsInPeriod = new Set(
      updatedSlots
        .filter((s) => s.day === slot.day && s.period === slot.period && s.id !== slot.id)
        .map((s) => s.room)
    );

    // Try finding non-conflicting teacher
    const freeTeacher = availableTeachers.find((t) => !usedTeachersInPeriod.has(t));
    const freeRoom = availableRooms.find((r) => !usedRoomsInPeriod.has(r));

    const oldTeacher = slot.teacher;
    const oldRoom = slot.room;

    if (freeTeacher && freeRoom) {
      slot.teacher = freeTeacher;
      slot.room = freeRoom;
      slot.isConflict = false;
      slot.conflictReason = undefined;
      slot.redstonePower = 15; // Fully powered signal
      resolvedCount++;

      summaryLog.push(
        `⚡ AUTO-RESOLVED [${slot.day} P${slot.period} - ${slot.grade}]: Reassigned ${oldTeacher} (${oldRoom}) -> ${freeTeacher} (${freeRoom})`
      );
    } else if (freeRoom) {
      slot.room = freeRoom;
      slot.isConflict = false;
      slot.conflictReason = undefined;
      slot.redstonePower = 15;
      resolvedCount++;

      summaryLog.push(
        `⚡ ROOM RESOLVED [${slot.day} P${slot.period} - ${slot.grade}]: Moved room from ${oldRoom} -> ${freeRoom}`
      );
    }
  }

  return {
    initialConflicts,
    resolvedConflicts: resolvedCount,
    unresolvedCount: initialConflicts - resolvedCount,
    resolvedSlots: updatedSlots,
    summaryLog,
  };
}

/**
 * Pure Dart function snippet to display in the developer architecture tab.
 */
export const PURE_DART_CONFLICT_RESOLVER_CODE = `
/// Pure Dart Redstone Conflict Resolution Algorithm
/// Solves Teacher & Room Double-Bookings for Riverpod State Management
import 'dart:math';

class TimetableSlot {
  final String id;
  final String day; // 'Mon', 'Tue', etc.
  final int period;
  final String grade;
  final String subject;
  String teacher;
  String room;
  bool isConflict;
  String? conflictReason;
  int redstonePower;

  TimetableSlot({
    required this.id,
    required this.day,
    required this.period,
    required this.grade,
    required this.subject,
    required this.teacher,
    required this.room,
    this.isConflict = false,
    this.conflictReason,
    this.redstonePower = 10,
  });
}

class ConflictResolutionResult {
  final int initialConflicts;
  final int resolvedConflicts;
  final List<TimetableSlot> resolvedSlots;
  final List<String> resolutionLogs;

  ConflictResolutionResult({
    required this.initialConflicts,
    required this.resolvedConflicts,
    required this.resolvedSlots,
    required this.resolutionLogs,
  });
}

ConflictResolutionResult autoResolveRedstoneTimetable(List<TimetableSlot> slots) {
  final List<TimetableSlot> updated = slots.map((s) => TimetableSlot(
    id: s.id,
    day: s.day,
    period: s.period,
    grade: s.grade,
    subject: s.subject,
    teacher: s.teacher,
    room: s.room,
    isConflict: s.isConflict,
    conflictReason: s.conflictReason,
    redstonePower: s.redstonePower,
  )).toList();

  final List<String> logs = [];
  final List<String> teachersPool = [
    'Prof. Oak', 'Dr. Minecraft', 'Ms. Redstone', 'Coach Steve', 'Mr. TNT'
  ];
  final List<String> roomsPool = [
    'Room 101 (Grass)', 'Room 201 (Redstone Lab)', 'Gym 1 (Slingshot)', 'Lab 3 (Obsidian)'
  ];

  int initialConflicts = 0;

  // Step 1: Detect collisions
  for (int i = 0; i < updated.length; i++) {
    final slotA = updated[i];
    for (int j = 0; j < updated.length; j++) {
      if (i == j) continue;
      final slotB = updated[j];

      if (slotA.day == slotB.day && slotA.period == slotB.period) {
        if (slotA.teacher == slotB.teacher || slotA.room == slotB.room) {
          slotA.isConflict = true;
          slotA.conflictReason = slotA.teacher == slotB.teacher 
              ? 'Teacher Double-Booked' 
              : 'Room Collision';
          initialConflicts++;
          break;
        }
      }
    }
  }

  int resolved = 0;

  // Step 2: Resolve collisions
  for (var slot in updated.where((s) => s.isConflict)) {
    final busyTeachers = updated
        .where((s) => s.day == slot.day && s.period == slot.period && s.id != slot.id)
        .map((s) => s.teacher)
        .toSet();

    final busyRooms = updated
        .where((s) => s.day == slot.day && s.period == slot.period && s.id != slot.id)
        .map((s) => s.room)
        .toSet();

    final availableTeacher = teachersPool.firstWhere(
      (t) => !busyTeachers.contains(t),
      orElse: () => slot.teacher,
    );

    final availableRoom = roomsPool.firstWhere(
      (r) => !busyRooms.contains(r),
      orElse: () => slot.room,
    );

    if (availableTeacher != slot.teacher || availableRoom != slot.room) {
      logs.add('BOOM! Resolved collision for \${slot.grade} [\${slot.day} P\${slot.period}]: \${slot.teacher} -> \$availableTeacher');
      slot.teacher = availableTeacher;
      slot.room = availableRoom;
      slot.isConflict = false;
      slot.conflictReason = null;
      slot.redstonePower = 15;
      resolved++;
    }
  }

  return ConflictResolutionResult(
    initialConflicts: initialConflicts,
    resolvedConflicts: resolved,
    resolvedSlots: updated,
    resolutionLogs: logs,
  );
}
`;
