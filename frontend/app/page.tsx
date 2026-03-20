"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MessageList from '@/components/MessageList';
import InputArea from '@/components/InputArea';
import { Message, BotPayload } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Connected to your database. Ask me anything about your data — I can generate insights, charts, and summaries."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const templateQuestions = [
    "Tell me about your database",
    "What data do you have available?",
    "Top 5 customers in December",
    "Sales by category",
    "Monthly revenue chart",
    "Top products"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: textToSend }
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: textToSend })
        }
      );

      const data = await res.json();
      console.log(data);


      const payload: BotPayload = data.response || {};
      
      // Determine if this is a conversational response (no chart data)
      const isConversational = (!payload.barchart?.labels?.length && !payload.piechart?.labels?.length);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.text || "Here is the result",
          payload,
          isConversational
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Backend connection error."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      {/* Sidebar */}
      <Sidebar 
        templateQuestions={templateQuestions} 
        onQuestionClick={handleSend} 
      />

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50/30">
        <Header />

        {/* Messages */}
        <MessageList messages={messages} loading={loading} />

        {/* Input Area - Floating Style */}
        <InputArea 
          input={input} 
          setInput={setInput} 
          onSend={() => handleSend()} 
          loading={loading} 
        />
      </main>
    </div>
  );
}