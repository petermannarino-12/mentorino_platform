
import React, { useState } from 'react';
import { Target, User, Users, GraduationCap, Compass, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { TaskActivity } from '../types';

interface TaskActivityFormProps {
  onSubmit: (activity: Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>) => Promise<void>;
  userName: string;
  isNetworkingOnly?: boolean;
  isBrandingOnly?: boolean;
}

const TaskActivityForm: React.FC<TaskActivityFormProps> = ({ onSubmit, userName, isNetworkingOnly, isBrandingOnly }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [pb, setPb] = useState({
    card_details: '',
    linkedin_url: '',
    resume_link: '',
    cover_letter_link: '',
    dress_code_notes: '',
    greeting_intro_notes: ''
  });
  
  const [net, setNet] = useState({
    attended_event: '',
    people_met: '',
    contact_info: '',
    panel_summary: ''
  });
  
  const [pw, setPw] = useState({
    introduction: '',
    volunteer_hours: ''
  });
  
  const [certTopic, setCertTopic] = useState('');
  const [roadmapTopic, setRoadmapTopic] = useState('');
  const [interviewRec, setInterviewRec] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        pb_card_details: pb.card_details,
        pb_linkedin_url: pb.linkedin_url,
        pb_resume_link: pb.resume_link,
        pb_cover_letter_link: pb.cover_letter_link,
        pb_dress_code_notes: pb.dress_code_notes,
        pb_greeting_intro_notes: pb.greeting_intro_notes,
        net_attended_event: net.attended_event,
        net_people_met: net.people_met,
        net_contact_info: net.contact_info,
        net_panel_summary: net.panel_summary,
        pw_introduction: pw.introduction,
        pw_volunteer_hours: pw.volunteer_hours,
        cert_topic: certTopic,
        roadmap_topic: roadmapTopic,
        interview_recommendation: interviewRec
      });
      setIsSuccess(true);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[40px] text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-900">Task List Submitted</h3>
        <p className="text-emerald-700/70 font-medium max-w-sm mx-auto">Your activity list has been sent to Peter for review. You will receive feedback shortly.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-6 px-10 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-emerald-700 transition-all shadow-lg"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {(!isNetworkingOnly || isBrandingOnly) && (
        <>
          {/* Personal Branding */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><User size={20} /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Personal Branding</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Presence & Presentation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital or Paper Card Creation</label>
                <input 
                  type="text" 
                  value={pb.card_details}
                  onChange={e => setPb({ ...pb, card_details: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                  placeholder="Card design or physical status..."
                  required={isBrandingOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn Review Inquiry</label>
                <input 
                   type="url" 
                   value={pb.linkedin_url}
                   onChange={e => setPb({ ...pb, linkedin_url: e.target.value })}
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                   placeholder="LinkedIn Profile URL..."
                   required={isBrandingOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Resume Review Link</label>
                <input 
                   type="url" 
                   value={pb.resume_link}
                   onChange={e => setPb({ ...pb, resume_link: e.target.value })}
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                   placeholder="Drive/Dropbox link..."
                   required={isBrandingOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Letter Draft</label>
                <input 
                   type="url" 
                   value={pb.cover_letter_link}
                   onChange={e => setPb({ ...pb, cover_letter_link: e.target.value })}
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                   placeholder="Shareable link..."
                   required={isBrandingOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Dress Code</label>
                <textarea 
                  value={pb.dress_code_notes}
                  onChange={e => setPb({ ...pb, dress_code_notes: e.target.value })}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]" 
                  placeholder="Dress code plan or consultation notes..."
                  required={isBrandingOnly}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Greeting & Intro</label>
                <textarea 
                  value={pb.greeting_intro_notes}
                  onChange={e => setPb({ ...pb, greeting_intro_notes: e.target.value })}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]" 
                  placeholder="Your elevator pitch / intro draft..."
                  required={isBrandingOnly}
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Roadmap & Interview Prep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Compass size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Career Roadmap</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">(Add the topic only)</label>
                <input 
                  type="text" 
                  value={roadmapTopic}
                  onChange={e => setRoadmapTopic(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                  placeholder="Roadmap target topic..."
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Target size={20} /></div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Interview Prep</h3>
                   <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Recommendation process</p>
                </div>
              </div>
              <div className="space-y-2">
                <textarea 
                  value={interviewRec}
                  onChange={e => setInterviewRec(e.target.value)}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]" 
                  placeholder="Details on recommendations or prep status..."
                ></textarea>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Networking Loop */}
      {!isBrandingOnly && (
        <div className="space-y-8 pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={20} /></div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Networking Feedback</h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Connect & Summarize</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Attend an event</label>
              <input 
                type="text" 
                value={net.attended_event}
                onChange={e => setNet({ ...net, attended_event: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                placeholder="Event name..."
                required={isNetworkingOnly}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Meet at least one person</label>
              <input 
                type="text" 
                value={net.people_met}
                onChange={e => setNet({ ...net, people_met: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                placeholder="Person's name..."
                required={isNetworkingOnly}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Submit contact info for who met</label>
              <input 
                type="text" 
                value={net.contact_info}
                onChange={e => setNet({ ...net, contact_info: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                placeholder="Email/LinkedIn/Phone..."
                required={isNetworkingOnly}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Summarize which panel topic you enjoyed and why</label>
              <textarea 
                value={net.panel_summary}
                onChange={e => setNet({ ...net, panel_summary: e.target.value })}
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[120px]" 
                placeholder="Your takeaways..."
                required={isNetworkingOnly}
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {(!isNetworkingOnly && !isBrandingOnly) && (
        <>
          {/* Partner Work */}
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><BriefcaseIcon size={20} /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Partner Work</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Collaborations & volunteering</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Introduce someone from the event to your peer</label>
                <input 
                  type="text" 
                  value={pw.introduction}
                  onChange={e => setPw({ ...pw, introduction: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                  placeholder="Who did you introduce?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Volunteer hours</label>
                <input 
                  type="text" 
                  value={pw.volunteer_hours}
                  onChange={e => setPw({ ...pw, volunteer_hours: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                  placeholder="e.g. 5 hours"
                />
              </div>
            </div>
          </div>

          {/* Planning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><GraduationCap size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Certification Planning</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">(Add the topic only)</label>
                <input 
                  type="text" 
                  value={certTopic}
                  onChange={e => setCertTopic(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                  placeholder="Topic only..."
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Compass size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Career Roadmap</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">(Add the topic only)</label>
                <input 
                  type="text" 
                  value={roadmapTopic}
                  onChange={e => setRoadmapTopic(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                  placeholder="Topic only..."
                />
              </div>
            </div>
          </div>

          {/* Interview Prep */}
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Target size={20} /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Interview prep</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next steps preparation</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Recommendation process</label>
              <textarea 
                value={interviewRec}
                onChange={e => setInterviewRec(e.target.value)}
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]" 
                placeholder="Details..."
              ></textarea>
            </div>
          </div>
        </>
      )}

      <div className="pt-10">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>{isBrandingOnly ? 'SUBMIT BRANDING PROFILE' : isNetworkingOnly ? 'SUBMIT NETWORKING REPORT' : 'SUBMIT FOR AUDIT'} <Send size={18} /></>
          )}
        </button>
      </div>
    </form>
  );
};

// Helper for Lucide icon
const BriefcaseIcon = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

export default TaskActivityForm;
