import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 sm:mb-12 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
      >
        <ArrowLeft size={18} className="sm:size-[20px] text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="bg-white p-8 sm:p-12 rounded-[32px] sm:rounded-[48px] border border-black/[0.03] shadow-sm space-y-6 sm:space-y-8">
        {submitted ? (
          <div className="text-center py-12 sm:py-20 animate-in zoom-in duration-500">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4 sm:mb-6 sm:size-[64px]" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Evaluation Sent</h2>
            <p className="text-slate-400 text-[10px] sm:text-xs font-semibold mt-2">Redirecting to portal...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Session Audit</h1>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Session Experience Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl font-black text-xs hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">{i}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brief Summary of Takeaways</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium outline-none focus:border-black transition-all min-h-[120px]" placeholder="Key insights..." />
              </div>
              <button onClick={handleSubmit} className="btn-normal w-full py-4 sm:py-5 bg-black text-white">Submit Evaluation</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyPage;
