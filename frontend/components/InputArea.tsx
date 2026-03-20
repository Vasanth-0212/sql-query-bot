"use client";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

export default function InputArea({ input, setInput, onSend, loading }: InputAreaProps) {
  return (
    <footer className="p-6 bg-gradient-to-t from-white via-white/80 to-transparent">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-center bg-white border border-slate-200 rounded-[22px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            className="flex-1 bg-transparent px-5 py-3 text-[14px] font-medium outline-none placeholder:text-slate-400"
            placeholder="Ask anything about your data..."
          />
          <button
            onClick={onSend}
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
  );
}
