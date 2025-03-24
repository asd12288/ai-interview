"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  CONNECTING = "CONNECTING",
}

interface SavedMessages {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) => {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessages[]>([]);
  const [transcript, setTranscript] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: SavedMessages) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setTranscript(message.transcript);
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log("error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleCallGenerateFeedback = async (messages: SavedMessages[]) => {
    console.log("Generating feedback...");

    // Call the API to generate feedback
    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });

    if (success && id) {
      router.push(`/${interviewId}/feedback`);
    } else {
      console.error("An error occurred while generating feedback.");
      router.push(`/`);
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push(`/`);
      } else {
        handleCallGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";

      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };
  
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
    
  const isConnecting = callStatus === CallStatus.CONNECTING;
  const isActive = callStatus === CallStatus.ACTIVE;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
      <div className="relative w-full">
        {/* Status indicator */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-dark-300/80 backdrop-blur-sm rounded-full py-1.5 px-3">
          <span className={cn(
            "inline-block w-3 h-3 rounded-full",
            isActive ? "bg-green-500" : 
            isConnecting ? "bg-yellow-500 animate-pulse" : "bg-red-500"
          )}></span>
          <span className="text-sm font-medium text-light-100">
            {isActive ? "Interview in progress" : 
             isConnecting ? "Connecting..." : "Not connected"}
          </span>
        </div>
        
        <div className="call-view-container w-full rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Interviewer */}
            <div className={cn(
              "aspect-video relative rounded-2xl overflow-hidden transition-all duration-300",
              isActive ? "shadow-lg shadow-primary-200/10" : ""
            )}>
              <div className="absolute inset-0 bg-gradient-to-b from-dark-300 to-dark-100 opacity-20"></div>
              <div className="card-interviewer">
                <div className="avatar-container">
                  <div className="avatar">
                    <Image 
                      src="/ai-avatar.png" 
                      alt="AI Interviewer" 
                      width={120} 
                      height={120}
                      className="rounded-full object-cover z-10"
                    />
                    {isSpeaking && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-speak"></span>
                        <span className="animate-speak delay-75"></span>
                        <span className="animate-speak delay-150"></span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-primary-100">AI Interviewer</h3>
                  {isActive && (
                    <div className="flex items-center gap-1 text-sm text-light-200 mt-1">
                      <span className={isSpeaking ? "text-green-500" : "text-light-400"}>
                        {isSpeaking ? "Speaking" : "Listening"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* User */}
            <div className="aspect-video relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-dark-300 to-dark-100 opacity-10"></div>
              <div className="card-border h-full w-full">
                <div className="card h-full w-full flex flex-col items-center justify-center">
                  <div className="relative size-[120px] mb-3">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-200/20 to-primary-100/10 animate-pulse-slow blur-md"></div>
                    <Image
                      src="/user-avatar.png"
                      className="rounded-full object-cover size-[120px] border-2 border-dark-300 z-10 relative"
                      alt="user"
                      width={540}
                      height={540}
                    />
                  </div>
                  <h3 className="text-xl font-bold">{userName}</h3>
                  {isActive && (
                    <div className="flex items-center gap-1 text-sm text-light-200 mt-1">
                      <span className={!isSpeaking ? "text-green-500" : "text-light-400"}>
                        {!isSpeaking ? "Active" : "Waiting"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transcript Area */}
      {messages.length > 0 && (
        <div className="w-full">
          <div className="card-border w-full shadow-lg">
            <div className="card p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-200 to-primary-100 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-dark-300 text-xs font-bold">
                    {messages[messages.length - 1]?.role === "assistant" ? "AI" : "You"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-light-100 leading-relaxed transition-all duration-500",
                    "animate-fadeIn"
                  )}>
                    {transcript}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Call Controls */}
      <div className="w-full flex justify-center my-6">
        <div className="inline-flex items-center gap-4">
          {callStatus !== CallStatus.ACTIVE ? (
            <button 
              className={cn(
                "btn-call flex items-center gap-2 px-8 py-4 text-base",
                isConnecting && "opacity-80"
              )}
              onClick={handleCall}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Start Interview
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-4">
              <button 
                className="btn-disconnect flex items-center gap-2 px-8 py-4 text-base"
                onClick={handleDisconnect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                  <line x1="23" y1="1" x2="1" y2="23"></line>
                </svg>
                End Interview
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Helpful tips */}
      {isActive && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-dark-300/50 rounded-xl p-4 border border-dark-300">
            <h4 className="text-primary-100 font-medium mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Interview Tips
            </h4>
            <ul className="text-sm text-light-200 space-y-1 list-disc list-inside">
              <li>Speak clearly and at a normal pace</li>
              <li>Wait for the interviewer to finish speaking before answering</li>
              <li>If you need to end the interview early, click the "End Interview" button</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;
