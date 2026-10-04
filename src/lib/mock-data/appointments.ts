import { Appointment } from "@/types"
import { subDays, addDays, format, setHours, setMinutes } from "date-fns"
import { services } from "./services"

const staffIds = [
  "staff-001",
  "staff-002",
  "staff-003",
  "staff-004",
  "staff-005",
  "staff-006",
  "staff-007",
]

// Therapists do not book evenly: senior staff carry fuller calendars and
// newer ones ramp up. Picking uniformly from `staffIds` makes every therapist
// land within a few percent of each other, which leaves the leaderboard and
// the top-earner charts with nothing to show. These weights spread the roster
// across roughly a 2:1 range between the busiest and the quietest.
const staffWeights = [26, 22, 18, 14, 10, 7, 3]

const weightedStaffIds = staffIds.flatMap((id, i) =>
  Array.from({ length: staffWeights[i] }, () => id)
)

const clientIds = Array.from({ length: 35 }, (_, i) =>
  `client-${String(i + 1).padStart(3, "0")}`
)

const serviceIds = services.map((s) => s.id)

// Index-based pseudo-random helpers for deterministic output
function pseudoChoice<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

function pseudoInt(min: number, max: number, seed: number): number {
  return min + (Math.abs(seed) % (max - min + 1))
}

// Total appointments generated, and how many of them land in the past.
// The remainder (TOTAL - PAST) are upcoming appointments within the next 14 days.
const TOTAL_APPOINTMENTS = 1600
const PAST_APPOINTMENTS = 1520

function generateAppointments(): Appointment[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const appointments: Appointment[] = []

  // 1,600 appointments spread across -90 days to +14 days (104 day window).
  // Sized so that a 7-therapist spa books ~17 appointments/day, which keeps
  // revenue in a realistic ratio to the payroll and rent in ./expenses.
  for (let i = 0; i < TOTAL_APPOINTMENTS; i++) {
    const seed1 = (i * 17 + 3) % 1000
    const seed2 = (i * 31 + 7) % 1000
    const seed3 = (i * 13 + 11) % 1000
    const seed4 = (i * 23 + 5) % 1000
    const seed5 = (i * 37 + 19) % 1000

    // Distribute days: most in the past 90 days, some in the next 14.
    // Day 0 sits in the past bucket so that today gets the same booking
    // density as any other day — the dashboard's "today" metrics read from
    // real rows instead of falling back to a constant.
    let dayOffset: number
    if (i < PAST_APPOINTMENTS) {
      // Today through 90 days ago
      dayOffset = -(pseudoInt(0, 90, seed1))
    } else {
      // Future: +1 to +14 days
      dayOffset = pseudoInt(1, 14, seed1)
    }

    const appointmentDate =
      dayOffset < 0 ? subDays(today, Math.abs(dayOffset)) : addDays(today, dayOffset)

    // Set appointment hour (9 AM to 5 PM range)
    const hour = pseudoInt(9, 17, seed2)
    const minuteOptions = [0, 15, 30, 45]
    const minute = pseudoChoice(minuteOptions, seed3)
    const scheduledAt = setMinutes(setHours(appointmentDate, hour), minute)

    const staffId = pseudoChoice(weightedStaffIds, seed2)
    const clientId = pseudoChoice(clientIds, (i * 7 + 3))
    const serviceId = pseudoChoice(serviceIds, seed3)
    const service = services.find((s) => s.id === serviceId)!

    // Status distribution
    // Future appointments must be SCHEDULED. Today's are split by the clock:
    // slots that have already passed are finished, later ones are still booked.
    // Past: 70% COMPLETED, 12% CANCELLED, 8% NO_SHOW, 10% COMPLETED
    let status: Appointment["status"]
    if (dayOffset > 0) {
      status = "SCHEDULED"
    } else if (dayOffset === 0 && scheduledAt.getTime() > Date.now()) {
      status = "SCHEDULED"
    } else {
      const statusSeed = seed4 % 100
      if (statusSeed < 70) {
        status = "COMPLETED"
      } else if (statusSeed < 82) {
        status = "CANCELLED"
      } else if (statusSeed < 90) {
        status = "NO_SHOW"
      } else {
        // remaining 10% of past are "COMPLETED" too (since SCHEDULED in past looks odd)
        status = "COMPLETED"
      }
    }

    // Location: 60% IN_SPA, 40% REMOTE
    const locationType: Appointment["location_type"] =
      seed5 % 10 < 6 ? "IN_SPA" : "REMOTE"

    // Satisfaction rating: only for COMPLETED, weighted 3-5 (mostly 4-5)
    let satisfactionRating: number | null = null
    if (status === "COMPLETED") {
      const ratingSeed = seed3 % 100
      if (ratingSeed < 10) {
        satisfactionRating = 3
      } else if (ratingSeed < 45) {
        satisfactionRating = 4
      } else {
        satisfactionRating = 5
      }
    }

    // Location notes for remote
    const remoteNotes = [
      "Client home visit - downtown area",
      "Office building, Suite 400",
      "Client residence - South Austin",
      "Hotel room - Marriott Downtown",
      "Client home - East Side",
      "Corporate office wellness event",
      "Client residence - North Austin",
    ]

    const locationNotes =
      locationType === "REMOTE" ? pseudoChoice(remoteNotes, seed4) : ""

    // Appointment notes
    const noteOptions = [
      "",
      "",
      "",
      "Client requested extra focus on shoulders",
      "Follow-up from previous session",
      "First-time client consultation included",
      "Client arrived 10 minutes late",
      "Extended session by 15 minutes",
      "Client very satisfied with results",
      "Recommended follow-up in two weeks",
      "Used heated towels per client request",
      "Client prefers minimal conversation",
      "Adjusted pressure mid-session per feedback",
      "",
      "",
    ]
    const notes = pseudoChoice(noteOptions, (i * 11 + 2))

    const createdAtDate = subDays(scheduledAt, pseudoInt(1, 14, seed5))

    appointments.push({
      id: `apt-${String(i + 1).padStart(3, "0")}`,
      client_id: clientId,
      staff_id: staffId,
      service_id: serviceId,
      scheduled_at: format(scheduledAt, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      duration_minutes: service.default_duration_minutes,
      status,
      location_type: locationType,
      location_notes: locationNotes,
      satisfaction_rating: satisfactionRating,
      notes,
      created_at: format(createdAtDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updated_at: format(scheduledAt, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    })
  }

  // Sort by scheduled_at descending (most recent first)
  appointments.sort(
    (a, b) =>
      new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  )

  return appointments
}

export const appointments = generateAppointments()
