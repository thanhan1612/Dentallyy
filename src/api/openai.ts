import { NextResponse } from 'next/server';
import openai from '@/lib/openai';

// interface cho data được đưa vào request của openai
interface AnalyzeRequest {
    patients: any[];
    appointments: any[];
    payments: any[];
    inventory: any[];
}
// interface cho data được trả về bởi openai
interface AnalysisResponse {
    summary: {
        PatientGrowth: string;
        OptimiseSchedule: string;
        LowStock: string;
        ConflictingSchedule: string;
    }
}
export async function POST(request:Request) {
    const body:AnalyzeRequest = await request.json();
    if (!body.patients || !body.appointments || !body.payments || !body.inventory) {
            return NextResponse.json(
                { error: "All data fields (patients, appointments, payments, inventory) are required" }, 
                { status: 400 }
            );
    }
    try {
       const prompt = `
            You are a healthcare data analyst. Analyze the following healthcare facility data and provide insights in the exact JSON format specified below.

            Data Summary:
            - Total Patients: ${body?.patients}
            - Total Appointments: ${body?.appointments}
            - Low Stock Items: ${body?.inventory}
            - Payment Revenue: $${body?.payments}

            Based on this data, provide analysis for:
            1. Patient growth prediction for next month (one sentence)
            2. Schedule optimization recommendations (one sentence)
            3. Inventory management - days until stock runs out (one sentence)
            4. Potential scheduling conflicts (one sentence)

            Return ONLY this JSON object with no additional text:
            {
                "summary": {
                    "PatientGrowth": "your analysis here",
                    "OptimiseSchedule": "your analysis here", 
                    "LowStock": "your analysis here",
                    "ConflictingSchedule": "your analysis here"
                }
            }`;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a data analyst." },
                { role: "user", content: prompt },
            ],
            max_tokens: 300,
        });
        const content = response.choices[0].message.content?.trim();
        let result: AnalysisResponse;
        try {
            result = JSON.parse(content || '{}');
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            return NextResponse.json(
                { error: "Invalid response format from AI" }, 
                { status: 500 }
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 });
    }
}