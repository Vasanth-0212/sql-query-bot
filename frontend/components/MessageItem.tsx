"use client";

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
import { Message } from '@/types';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`flex animate-in fade-in slide-in-from-bottom-3 duration-500 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[90%] md:max-w-[80%] rounded-3xl px-6 py-4 shadow-sm transition-all ${
          message.role === "user"
            ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100"
            : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${
              message.role === "user" ? "text-indigo-100" : "text-indigo-600"
            }`}
          >
            {message.role === "user" ? "Request" : message.isConversational ? "Assistant" : "Analysis Result"}
          </span>
        </div>

        <p className={`text-[15px] leading-relaxed font-medium ${message.isConversational ? "mb-2" : "mb-4"}`}>
          {message.content}
        </p>

        {/* Conversational responses get special treatment */}
        {message.isConversational && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 italic">
              💡 You can ask me to analyze specific data, generate charts, or dive deeper into any aspect of your database.
            </p>
          </div>
        )}

        {/* ---------- VISUALIZATIONS ---------- */}
        {(message.payload?.barchart || message.payload?.piechart) && (
          <div className="mt-6 space-y-4 animate-in zoom-in-95 duration-500">
            {/* BAR CHART CARD */}
            {message.payload?.barchart?.labels && message.payload.barchart.labels.length > 0 && (
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tight">Distribution View</h4>
                <div className="w-full h-72">
                  <ResponsiveContainer>
                    <BarChart
                      data={message.payload.barchart.labels.map((l: string, idx: number) => ({
                        name: l,
                        value: message.payload?.barchart?.values[idx]
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
            {message.payload?.piechart?.labels && message.payload.piechart.labels.length > 0 && (
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tight">Proportional Breakdown</h4>
                <div className="w-full h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={message.payload.piechart.labels.map((l: string, idx: number) => ({
                          name: l,
                          value: message.payload?.piechart?.values[idx]
                        }))}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                      >
                        {message.payload.piechart.labels.map((_, i) => (
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
  );
}
