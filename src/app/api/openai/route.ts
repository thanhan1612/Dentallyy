import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ClinicStats } from "@/utils/build-clinic-stats";

// Runs on the server only — OPENAI_API_KEY never reaches the browser.
export const runtime = "nodejs";

export interface AnalysisResponse {
  summary: {
    PatientGrowth: string;
    OptimiseSchedule: string;
    LowStock: string;
    ConflictingSchedule: string;
  };
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server" }, { status: 500 });
  }

  let stats: ClinicStats;
  try {
    stats = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!stats?.patients || !stats?.appointments || !stats?.revenue || !stats?.inventory) {
    return NextResponse.json({ error: "patients, appointments, revenue and inventory stats are required" }, { status: 400 });
  }
  // Payload is aggregate numbers only; reject anything suspiciously large.
  const body = JSON.stringify(stats);
  if (body.length > 20_000) {
    return NextResponse.json({ error: "Stats payload too large" }, { status: 413 });
  }

  const prompt = `Đây là số liệu tổng hợp (ẩn danh) của một phòng khám nha khoa. Hôm nay là ${new Date().toISOString().slice(0, 10)}.
Doanh thu tính bằng VND. "monthlyNew" là số bệnh nhân mới theo tháng; "byWeekday"/"byTimeSlot" là phân bố lịch hẹn;
"conflicts" là số khung giờ mà một bác sĩ bị đặt từ 2 lịch trở lên.

${body}

Dựa CHỈ trên số liệu trên, viết mỗi mục 1–2 câu bằng tiếng Việt, có trích số cụ thể. Nếu dữ liệu không đủ, nói rõ điều đó thay vì đoán.
- PatientGrowth: xu hướng bệnh nhân mới và dự đoán tháng tới.
- OptimiseSchedule: đề xuất tối ưu lịch (ngày/khung giờ quá tải hoặc vắng).
- LowStock: vật tư sắp hết / hết hạn cần nhập thêm (nêu tên).
- ConflictingSchedule: tình trạng trùng lịch của bác sĩ và cách xử lý.

Trả về JSON đúng dạng: {"summary":{"PatientGrowth":"","OptimiseSchedule":"","LowStock":"","ConflictingSchedule":""}}`;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        { role: "system", content: "Bạn là chuyên viên phân tích dữ liệu vận hành phòng khám nha khoa. Chỉ trả lời bằng JSON." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as Partial<AnalysisResponse>;
    const s = parsed.summary || ({} as AnalysisResponse["summary"]);
    const result: AnalysisResponse = {
      summary: {
        PatientGrowth: s.PatientGrowth || "Chưa đủ dữ liệu.",
        OptimiseSchedule: s.OptimiseSchedule || "Chưa đủ dữ liệu.",
        LowStock: s.LowStock || "Chưa đủ dữ liệu.",
        ConflictingSchedule: s.ConflictingSchedule || "Chưa đủ dữ liệu.",
      },
    };
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI analysis failed:", error?.status, error?.message);
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 502 });
  }
}
