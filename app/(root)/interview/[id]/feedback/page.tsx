import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

const FeedbackPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  if (!feedback) redirect("/");

  const formattedDate = dayjs(feedback.createdAt).format("DD MMM, YYYY");

  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Function to determine progress bar color
  const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <section className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-100 mb-1">Interview Feedback</h1>
          <p className="text-light-200">{interview.role} Position</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-400 rounded-lg px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-200">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <div className="text-light-100">{formattedDate}</div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="card-border w-full mb-12 overflow-hidden">
        <div className="card p-8 bg-gradient-to-r from-dark-500 to-dark-400">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <h3 className="text-xl font-bold text-primary-100">Overall Performance</h3>
              <p className="text-xl text-light-200">{interview.role} Interview</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className={`text-7xl font-bold ${getScoreColor(feedback.totalScore)}`}>
                {feedback.totalScore}
              </div>
              <div className="flex items-center gap-1 text-light-100">
                <span>out of</span>
                <span className="font-semibold">100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <h3 className="text-xl font-bold mb-5 text-primary-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20V10"></path>
          <path d="M18 20V4"></path>
          <path d="M6 20v-4"></path>
        </svg>
        Performance by Category
      </h3>
      <div className="grid grid-cols-1 gap-6 mb-12">
        {feedback.categoryScores.map((category, index) => (
          <div key={index} className="card-border w-full transition-all hover:shadow-lg">
            <div className="card p-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">{category.name}</h3>
                  <div className={`text-xl font-bold ${getScoreColor(category.score)}`}>
                    {category.score}/100
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div
                    className={`rounded-full h-3 transition-all ${getProgressBarColor(category.score)}`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>

                <p className="text-light-100 leading-relaxed">{category.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-5 text-primary-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                <line x1="16" y1="8" x2="2" y2="22"></line>
                <line x1="17.5" y1="15" x2="9" y2="15"></line>
              </svg>
              Strengths
            </h3>
            <div className="card-border w-full h-full">
              <div className="card p-6 h-full bg-gradient-to-b from-dark-500 to-dark-400">
                <ul className="space-y-3">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-light-100 flex items-start gap-2">
                      <span className="inline-flex mt-1 items-center justify-center rounded-full bg-green-500/20 w-5 h-5 text-green-500">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        <div>
          <h3 className="text-xl font-bold mb-5 text-primary-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Areas for Improvement
          </h3>
          <div className="card-border w-full h-full">
            <div className="card p-6 h-full bg-gradient-to-b from-dark-500 to-dark-400">
              <ul className="space-y-3">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="text-light-100 flex items-start gap-2">
                    <span className="inline-flex mt-1 items-center justify-center rounded-full bg-red-500/20 w-5 h-5 text-red-500">!</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <h3 className="text-xl font-bold mb-5 text-primary-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Final Assessment
      </h3>
      <div className="card-border w-full mb-12">
        <div className="card p-6 bg-dark-400">
          <p className="text-light-100 leading-relaxed">{feedback.finalAssessment}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <Button asChild className="btn-secondary px-6 py-5 rounded-lg text-base">
          <Link href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild className="btn px-6 py-5 rounded-lg text-base">
          <Link href="/interview/new">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Start New Interview
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FeedbackPage;
