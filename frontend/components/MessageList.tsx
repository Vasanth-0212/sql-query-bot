"use client";

import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 custom-scrollbar">
      <div className="mx-auto max-w-4xl space-y-10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex animate-in fade-in slide-in-from-bottom-3 duration-500 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] md:max-w-[80%] rounded-3xl px-6 py-4 shadow-sm transition-all ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100"
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${
                    msg.role === "user" ? "text-indigo-100" : "text-indigo-600"
                  }`}
                >
                  {msg.role === "user" ? "Request" : msg.isConversational ? "Assistant" : "Analysis Result"}
                </span>
              </div>

              <p className={`text-[15px] leading-relaxed font-medium ${msg.isConversational ? "mb-2" : "mb-4"}`}>
                {msg.content}
              </p>

              {/* Conversational responses get special treatment */}
              {msg.isConversational && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 italic">
                    💡 You can ask me to analyze specific data, generate charts, or dive deeper into any aspect of your database.
                  </p>
                </div>
              )}

              {/* ---------- VISUALIZATIONS ---------- */}
              {(msg.payload?.barchart || msg.payload?.piechart) && (
                <div className="mt-6 space-y-4 animate-in zoom-in-95 duration-500">
                  {/* BAR CHART CARD */}
                  {msg.payload?.barchart?.labels && msg.payload.barchart.labels.length > 0 && (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tight">Distribution View</h4>
                      <div className="w-full h-72">
                        {/* Chart content would go here - moved to MessageItem */}
                        <p className="text-center text-slate-500">Bar chart visualization</p>
                      </div>
                    </div>
                  )}

                  {/* PIE CHART CARD */}
                  {msg.payload?.piechart?.labels && msg.payload.piechart.labels.length > 0 && (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tight">Proportional Breakdown</h4>
                      <div className="w-full h-72">
                        {/* Chart content would go here - moved to MessageItem */}
                        <p className="text-center text-slate-500">Pie chart visualization</p>
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
  );
}
