"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

type BotPayload = {
  text?: string;
  barchart?: {
    labels: string[];
    values: number[];
    xLabel?: string;
    yLabel?: string;
  };
  piechart?: {
    labels: string[];
    values: number[];
  };
};

type Message = {
  role: "user" | "assistant";
  content: string;
  payload?: BotPayload;
};

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: textToSend })
        }
      );

      const data = await res.json();
      console.log(data);


      const payload: BotPayload = data.response || {};

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.text || "Here is the result",
          payload
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
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <span className="text-sm font-bold font-mono">DB</span>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">Database Agent</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Connection</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">
            Suggested Queries
          </p>

          <div className="space-y-2">
            {templateQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="group w-full text-left rounded-xl border border-slate-100 p-3 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all duration-200 active:scale-[0.98]"
              >
                <span className="line-clamp-2">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50/30">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status:</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Agent Online
            </span>
          </div>
          <Image className="opacity-40 grayscale" src="/next.svg" alt="" width={60} height={12} />
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 custom-scrollbar">
          <div className="mx-auto max-w-4xl space-y-10">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex animate-in fade-in slide-in-from-bottom-3 duration-500 ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[80%] rounded-3xl px-6 py-4 shadow-sm transition-all ${msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100"
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${msg.role === "user" ? "text-indigo-100" : "text-indigo-600"
                      }`}>
                      {msg.role === "user" ? "Request" : "Analysis Result"}
                    </span>
                  </div>

                  <p className="text-[15px] leading-relaxed font-medium mb-4">{msg.content}</p>

                  {/* ---------- VISUALIZATIONS ---------- */}
                  {(msg.payload?.barchart || msg.payload?.piechart) && (
                    <div className="mt-6 space-y-4 animate-in zoom-in-95 duration-500">

                      {/* BAR CHART CARD */}
                      {msg.payload?.barchart?.labels && msg.payload.barchart.labels.length > 0 && (
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tight">Distribution View</h4>
                          <div className="w-full h-72">
                            <ResponsiveContainer>
                              <BarChart
                                data={msg.payload.barchart.labels.map((l: string, idx: number) => ({
                                  name: l,
                                  value: msg.payload?.barchart?.values[idx]
                                }))}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* PIE CHART CARD */}
                      {msg.payload?.piechart?.labels && msg.payload.piechart.labels.length > 0 && (
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tight">Proportional Breakdown</h4>
                          <div className="w-full h-72">
                            <ResponsiveContainer>
                              <PieChart>
                                <Pie
                                  data={msg.payload.piechart.labels.map((l: string, idx: number) => ({
                                    name: l,
                                    value: msg.payload?.piechart?.values[idx]
                                  }))}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                >
                                  {msg.payload.piechart.labels.map((_, i) => (
                                    <Cell
                                      key={i}
                                      fill={["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][i % 5]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600/60">
                  Processing Database Query...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Floating Style */}
        <footer className="p-6 bg-gradient-to-t from-white via-white/80 to-transparent">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-[22px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent px-5 py-3 text-[14px] font-medium outline-none placeholder:text-slate-400"
                placeholder="Ask your database a question..."
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-8 py-3 rounded-[16px] font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-200/50"
              >
                {loading ? '...' : 'Run'}
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Press <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 border border-slate-200 mx-1">Enter</kbd> to execute natural language SQL
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}