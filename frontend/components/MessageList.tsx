"use client";

import { Message } from '@/types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onQuestionSelect?: (question: string) => void;
}

export default function MessageList({ messages, loading, onQuestionSelect }: MessageListProps) {
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
                  <p className="text-[11px] text-slate-500 italic mb-3">
                    💡 You can ask me to analyze specific data, generate charts, or dive deeper into any aspect of your database.
                  </p>
                  
                  {/* Follow-up Questions */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Suggested Questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.followUpQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => onQuestionSelect?.(question)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            <span className="mr-1">🔍</span>
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Questions for Data Responses */}
              {!msg.isConversational && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Explore Further:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => onQuestionSelect?.(question)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
                        >
                          <span className="mr-1">📊</span>
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
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
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={msg.payload?.barchart?.labels.map((label, index) => ({
                            name: label,
                            value: msg.payload?.barchart?.values[index]
                          })) || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#f8fafc', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="#6366f1" 
                              radius={[4, 4, 0, 0]}
                            />
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
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={msg.payload?.piechart?.labels.map((label, index) => ({
                                name: label,
                                value: msg.payload?.piechart?.values[index]
                              })) || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {msg.payload?.piechart?.labels.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#f8fafc', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
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
  );
}
