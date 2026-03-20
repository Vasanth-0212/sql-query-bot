"use client";

interface SidebarProps {
  templateQuestions: string[];
  onQuestionClick: (question: string) => void;
}

export default function Sidebar({ templateQuestions, onQuestionClick }: SidebarProps) {
  return (
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
              onClick={() => onQuestionClick(q)}
              className="group w-full text-left rounded-xl border border-slate-100 p-3 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all duration-200 active:scale-[0.98]"
            >
              <span className="line-clamp-2">{q}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
