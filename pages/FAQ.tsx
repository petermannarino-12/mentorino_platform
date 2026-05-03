import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Search, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    { cat: 'General', q: "Is this guidance only for IT professionals?", a: "No. It covers career, education, and life guidance for people across all disciplines seeking clarity and high performance." },
    { cat: 'Programs', q: "Do I need to know my goals before applying?", a: "No. Many people apply precisely because they feel unsure. Our first session is designed to map out those goals." },
    { cat: 'Programs', q: "What is the commitment?", a: "Applications are vetted for seriousness. We expect full dedication to the trajectory map we build together." },
    { cat: 'Consultation', q: "Is this paid?", a: "Yes. Paid guidance ensures seriousness and commitment from both the mentee and the mentor. We offer various price points from digital products to 1:1 sessions." },
    { cat: 'Logistics', q: "How are sessions conducted?", a: "We offer a variety of options ranging from in-person, virtual or hybrid. This allows the mentee to customize their program." },
    { cat: 'Logistics', q: "What is the refund policy?", a: "Sessions are non-refundable once conducted. Digital products carry a 24-hour satisfaction guarantee." },
    { cat: 'Programs', q: "Do you accept everyone?", a: "No. Applications are reviewed to ensure a good fit. We will notify you of not being a fit." }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-16 px-4 sm:px-6 animate-in fade-in duration-700">
      <div className="flex flex-col items-center mb-10 sm:mb-16">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 sm:mb-12 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-black group-hover:-translate-x-1 transition-transform" />
        </button>

        <header className="space-y-4 sm:space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">The <br /><span className="text-slate-300">FAQ.</span></h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium px-4">Everything you need to know about starting your guidance journey.</p>
          <div className="relative max-w-md mx-auto pt-6 sm:pt-8 w-full">
            <Search className="absolute left-4 top-1/2 translate-y-1 sm:translate-y-2 text-slate-300 sm:w-[18px] sm:h-[18px]" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-6 py-3.5 sm:py-4 bg-white border border-black/[0.03] rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest focus:border-black outline-none transition-all shadow-sm"
            />
          </div>
        </header>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
          <div key={i} className="bg-white border border-black/[0.03] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-sm hover:border-black/10 transition-all">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 sm:p-8 flex items-center justify-between text-left group"
            >
              <div className="space-y-1">
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">{faq.cat}</span>
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-tight group-hover:text-slate-600 transition-colors pr-4">{faq.q}</h3>
              </div>
              <div className={`shrink-0 p-1.5 sm:p-2 rounded-full transition-all ${openIndex === i ? 'bg-black text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                {openIndex === i ? <Minus size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
              </div>
            </button>
            {openIndex === i && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 animate-in slide-in-from-top-2 duration-300">
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold pt-4 sm:pt-6 border-t border-slate-50">{faq.a}</p>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10 sm:py-20 text-slate-300 font-black uppercase text-[8px] sm:text-[10px]">No matches found</div>
        )}
      </div>

      <div className="mt-12 sm:mt-20 p-8 sm:p-12 bg-slate-900 text-white rounded-[32px] sm:rounded-[48px] text-center space-y-4 sm:space-y-6">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest">Still have questions?</h3>
        <p className="text-[10px] sm:text-xs text-white/40 font-medium">Our team is ready to help you find the right path.</p>
        <button onClick={() => navigate('/contact')} className="btn-normal bg-white text-black px-8 sm:px-10 py-4 sm:py-5">Contact Support</button>
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;