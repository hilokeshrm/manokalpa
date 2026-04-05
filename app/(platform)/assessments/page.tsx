"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { ClipboardList, CheckCircle2, Clock, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  duration?: number | null;
  _count: { questions: number };
}

interface Result {
  id: string;
  assessmentId: string;
  score: number;
  level?: string | null;
  completedAt: string;
}

const levelColor: Record<string, string> = {
  minimal: "text-green-600 bg-green-50",
  low: "text-green-600 bg-green-50",
  mild: "text-yellow-600 bg-yellow-50",
  moderate: "text-orange-600 bg-orange-50",
  "moderately severe": "text-red-500 bg-red-50",
  severe: "text-red-700 bg-red-100",
  high: "text-red-500 bg-red-50",
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/assessments").then((r) => r.json()),
      fetch("/api/assessments/results").then((r) => r.json()).catch(() => ({ results: [] })),
    ]).then(([aData, rData]) => {
      setAssessments(aData.assessments || []);
      setResults(rData.results || []);
    }).finally(() => setLoading(false));
  }, []);

  const completedIds = new Set(results.map((r) => r.assessmentId));
  const completed = assessments.filter((a) => completedIds.has(a.id));
  const pending = assessments.filter((a) => !completedIds.has(a.id));

  const getResult = (id: string) => results.find((r) => r.assessmentId === id);

  return (
    <>
      <TopBar pageTitle="Assessments" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Progress summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-brand-teal bg-brand-teal-pale" },
            { label: "Pending", value: pending.length, icon: ClipboardList, color: "text-brand-purple bg-brand-purple-pale" },
            { label: "Total Assessments", value: assessments.length, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-bold text-2xl text-slate-900">{loading ? "—" : value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Available Assessments</h2>
                <div className="space-y-3">
                  {pending.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{a.title}</h3>
                          {a.category && <span className="badge bg-slate-100 text-slate-500 text-xs">{a.category}</span>}
                        </div>
                        {a.description && <p className="text-slate-500 text-sm mb-2">{a.description}</p>}
                        <div className="flex gap-4 text-xs text-slate-400">
                          {a.duration && <span className="flex items-center gap-1"><Clock size={11} /> {a.duration} min</span>}
                          <span className="flex items-center gap-1"><ClipboardList size={11} /> {a._count.questions} questions</span>
                        </div>
                      </div>
                      <Link href={`/assessments/${a.id}`} className="btn-primary !py-2 !text-sm gap-2 flex-shrink-0">
                        Start <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Completed</h2>
                <div className="space-y-3">
                  {completed.map((a) => {
                    const result = getResult(a.id);
                    const lvl = result?.level?.toLowerCase() || "";
                    return (
                      <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal-pale flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={20} className="text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{a.title}</h3>
                            {lvl && (
                              <span className={`badge text-xs ${levelColor[lvl] || "text-slate-500 bg-slate-100"}`}>
                                {result?.level}
                              </span>
                            )}
                          </div>
                          {result && (
                            <p className="text-slate-400 text-xs">
                              Score: {result.score.toFixed(1)} · Completed{" "}
                              {new Date(result.completedAt).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/assessments/${a.id}`}
                            className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Retake
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {assessments.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <ClipboardList size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No assessments available yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
