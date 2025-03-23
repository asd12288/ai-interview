import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  CONNECTING = "CONNECTING",
}

const Agent = ({ userName }: AgentProps) => {
  const callStatus = CallStatus.FINISHED;
  const isSpeaking = true;
  const messages = ["what is your name?", "my name is vapi"];
  const lastMessage = messages[messages.length - 1];

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="vapi" width={50} height={50} />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              className="rounded-full object-cover size-[120px]"
              alt="user"
              width={540}
              height={540}
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full justify-center flex">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call">
            <span
              className={cn("absolute animate-ping rounded-full opacity-75")}
            />

            <span>
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect">End</button>
        )}
      </div>
    </>
  );
};

export default Agent;
