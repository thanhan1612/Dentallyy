// Builds an anonymous, aggregate-only summary of clinic data for the AI analyst.
// No names, phone numbers or medical details leave the browser — only counts.

export interface ClinicStats {
  patients: { total: number; newThisMonth: number; newLastMonth: number; monthlyNew: Record<string, number> };
  appointments: {
    total: number;
    today: number;
    next7Days: number;
    byWeekday: Record<string, number>;
    byTimeSlot: Record<string, number>;
    byStatus: Record<string, number>;
    conflicts: number; // same doctor, same date + time slot
  };
  revenue: { thisMonth: number; lastMonth: number };
  inventory: {
    totalItems: number;
    lowStock: { name: string; amount: number; unit: string }[];
    expired: number;
    expiringIn30Days: number;
  };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const refId = (x: any): string | undefined => (typeof x === "string" ? x : x?.$id);
const inc = (obj: Record<string, number>, key: string) => (obj[key] = (obj[key] || 0) + 1);

export function isLowStock(item: any): boolean {
  const amount = Number(item?.amount ?? item?.total ?? 0);
  const unit = (item?.unit || "").toLowerCase();
  return (["chiếc", "ống", "cái"].includes(unit) && amount < 10) || (unit === "viên" && amount < 100);
}

export function buildClinicStats(
  patients: any[] = [],
  appointments: any[] = [],
  payments: any[] = [],
  inventory: any[] = [],
  now = new Date()
): ClinicStats {
  const thisMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const todayStr = now.toISOString().slice(0, 10);
  const in7 = new Date(now.getTime() + 7 * 864e5).toISOString().slice(0, 10);
  const in30 = new Date(now.getTime() + 30 * 864e5);

  const monthlyNew: Record<string, number> = {};
  patients.forEach((p) => p?.$createdAt && inc(monthlyNew, monthKey(new Date(p.$createdAt))));

  const byWeekday: Record<string, number> = {};
  const byTimeSlot: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const slotCounts: Record<string, number> = {};
  let today = 0;
  let next7Days = 0;
  appointments.forEach((a) => {
    const date: string | undefined = a?.appointment_date?.slice(0, 10);
    const time: string = a?.appointment_time_range || "unknown";
    if (date) {
      inc(byWeekday, WEEKDAYS[new Date(date + "T00:00:00").getDay()]);
      if (date === todayStr) today++;
      if (date >= todayStr && date <= in7) next7Days++;
    }
    inc(byTimeSlot, time);
    inc(byStatus, a?.status || "unknown");
    const doctors = Array.isArray(a?.staffManagement) ? a.staffManagement : [a?.staffManagement];
    doctors.map(refId).filter(Boolean).forEach((doc: any) => date && inc(slotCounts, `${doc}|${date}|${time}`));
  });
  const conflicts = Object.values(slotCounts).filter((n) => n > 1).length;

  const paidTotal = (p: any) =>
    (p?.paid || []).reduce((sum: number, x: any) => sum + Number(x?.title || 0), 0);
  let revThis = 0;
  let revLast = 0;
  payments.forEach((p) => {
    if (!p?.$createdAt) return;
    const k = monthKey(new Date(p.$createdAt));
    if (k === thisMonth) revThis += paidTotal(p);
    else if (k === lastMonth) revLast += paidTotal(p);
  });

  let expired = 0;
  let expiringIn30Days = 0;
  inventory.forEach((i) => {
    if (!i?.expiration_date) return;
    const exp = new Date(i.expiration_date);
    if (exp < now) expired++;
    else if (exp <= in30) expiringIn30Days++;
  });

  return {
    patients: {
      total: patients.length,
      newThisMonth: monthlyNew[thisMonth] || 0,
      newLastMonth: monthlyNew[lastMonth] || 0,
      monthlyNew,
    },
    appointments: { total: appointments.length, today, next7Days, byWeekday, byTimeSlot, byStatus, conflicts },
    revenue: { thisMonth: revThis, lastMonth: revLast },
    inventory: {
      totalItems: inventory.length,
      lowStock: inventory
        .filter(isLowStock)
        .slice(0, 20)
        .map((i) => ({ name: String(i?.name || "item").slice(0, 60), amount: Number(i?.amount ?? i?.total ?? 0), unit: i?.unit || "" })),
      expired,
      expiringIn30Days,
    },
  };
}
