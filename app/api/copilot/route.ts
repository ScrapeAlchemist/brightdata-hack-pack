import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/app/lib/copilot";
import type { VacancyParcel } from "@/app/lib/types";
import vacancyData from "@/app/data/vacancy_sample.json";

export async function POST(request: NextRequest) {
  let body: { question?: string; selectedParcel?: VacancyParcel | null };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { question, selectedParcel } = body;

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const parcels = vacancyData as VacancyParcel[];
  const response = answerQuestion(question, parcels, selectedParcel);

  return NextResponse.json(response);
}
