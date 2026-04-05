"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TopBar from "@/components/platform/TopBar";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  weight: number;
}

interface AssessmentData {
  id: string;
  title: string;
  description?: string | null;
  questions: Question[];
}

function getResultInfo(score: number, maxScore: number) {
  const pct = (score / maxScore) * 100;
  if (pct <= 15) return { level: "Minimal", color: "text-green-600 bg-green-50", tip: "Your responses suggest minimal or no significant symptoms. Keep up your self-care routines." };
  if (pct <= 35) return { level: "Mild", color: "text-yellow-600 bg-yellow-50", tip: "Mild symptoms detected. Consider journaling, exercise, and talking to someone you trust." };
  if (pct <= 55) return { level: "Moderate", color: "text-orange-600 bg-orange-50", tip: "Moderate symptoms. We recommend booking a session with one of our counsellors." };
  if (pct <= 75) return { level: "Moderately Severe", color: "text-red-500 bg-red-50", tip: "Please reach out to a counsellor soon. You deserve support." };
  return { level: "Severe", color: "text-red-700 bg-red-100", tip: "Please book an urgent session. Our team is here for you." };
}

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ level: string; color: string; tip: string; score: number; maxScore: number } | null>(null);

  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAssessment(data.assessment || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar pageTitle="Assessment" />
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 animate-pulse h-64" />
        </div>
      </>
    );
  }

  if (!assessment) {
    return (
      <>
        <TopBar pageTitle="Assessment" />
        <div className="p-6 max-w-2xl mx-auto text-center">
          <p className="text-slate-500">Assessment not found.</p>
          <Link href="/assessments" className="btn-primary mt-4 inline-flex">Back</Link>
        </div>
      </>
    );
  }

  const questions = assessment.questions;
  const currentQ = questions[current];
  const currentAnswer = answers[currentQ?.id] ?? -1;
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / questions.length) * 100;

  const getOptions = (q: Question) => {
    if (q.options && q.options.length > 0) return q.options;
    // Default SCALE options
    return ["Not at all", "Several days", "More than half the days", "Nearly every day"];
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const score = questions.reduce((sum, q) => {
      const val = answers[q.id] ?? 0;
      return sum + val * q.weight;
    }, 0);
    const maxScore = questions.reduce((sum, q) => sum + 3 * q.weight, 0);
    const resultInfo = getResultInfo(score, maxScore);

    try {
      await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          score,
          level: resultInfo.level,
          answers: questions.map((q) => ({ questionId: q.id, answer: String(answers[q.id] ?? 0) })),
        }),
      });
    } catch {}

    setResult({ ...resultInfo, score, maxScore });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted && result) {
    return (
      <>
        <TopBar pageTitle="Assessment Result" />
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-purple-pale flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} className="text-brand-purple" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Assessment Complete</h2>
            <p className="text-slate-500 mb-6">{assessment.title}</p>

            <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-lg font-bold mb-4 ${result.color}`}>
              {result.level} · Score: {result.score.toFixed(1)}/{result.maxScore.toFixed(1)}
            </div>

            <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full"
                style={{ width: `${(result.score / result.maxScore) * 100}%` }}
              />
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">{result.tip}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/appointments/book" className="btn-primary gap-2">
                <CheckCircle2 size={15} /> Book a Session
              </Link>
              <Link href="/assessments" className="btn-secondary">Back to Assessments</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar pageTitle={assessment.title} />
      <div className="p-6 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{totalAnswered} answered</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-purple rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-6">
          {assessment.description && (
            <p className="text-slate-500 text-sm mb-3">{assessment.description}</p>
          )}
          <h3 className="font-display text-xl font-bold text-slate-900 mb-6 leading-snug">
            {current + 1}. {currentQ.text}
          </h3>

          <div className="space-y-3">
            {getOptions(currentQ).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-medium ${
                  currentAnswer === idx
                    ? "border-brand-purple bg-brand-purple-pale text-brand-purple"
                    : "border-slate-100 text-slate-700 hover:border-slate-200"
                }`}
              >
                <span className="text-sm font-normal text-slate-400 mr-2">{idx}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className="btn-secondary gap-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {current < questions.length - 1 ? (
            <button
              disabled={currentAnswer === -1}
              onClick={() => setCurrent((c) => c + 1)}
              className="btn-primary flex-1 justify-center gap-2 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              disabled={currentAnswer === -1 || submitting}
              onClick={handleSubmit}
              className="btn-teal flex-1 justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Submit Assessment"} <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
