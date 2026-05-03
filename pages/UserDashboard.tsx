import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  HelpCircle,
  Home,
  LayoutGrid,
  ShieldCheck,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Compass,
  Calendar,
  CreditCard,
  History,
  Info,
  LogOut,
  MessageSquare,
  X,
  Zap
} from 'lucide-react';
import { useNavigate, Link, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Application, Booking, User, TaskActivity, NetworkEvent, Announcement, ResourceLink } from '../types';
import TaskActivityForm from '../components/TaskActivityForm';
import { formatToNJ } from '../src/lib/dateUtils';

interface UserDashboardProps {
  currentUser: User | null;
  application?: Application;
  bookings: Booking[];
  taskActivities: TaskActivity[];
  events: NetworkEvent[];
  onTaskSubmit: (activity: Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>) => Promise<void>;
  onTaskComplete?: (taskId: string) => void;
  onEventAttend: (eventId: string) => void;
  onLogout: () => void;
  announcements?: Announcement[];
  resourceLinks?: ResourceLink[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  currentUser, 
  application, 
  bookings, 
  taskActivities, 
  events, 
  onTaskSubmit, 
  onTaskComplete,
  onEventAttend, 
  onLogout,
  announcements = [],
  resourceLinks = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const upcomingSessions = bookings.filter(b => b.status === 'upcoming');
  const pastSessions = bookings.filter(b => b.status === 'completed');
  
  // Growth Strategy Completion
  const growthActivity = taskActivities.find(a => a.user_id === currentUser?.id);
  const isStrategyComplete = !!growthActivity?.roadmap_topic;

  // All products are available if approved
  const isApproved = application?.status === 'approved';
  const availableResources: any[] = [];

  const getStatusStep = () => {
    if (!application) return 0;
    if (application.status === 'pending') return 1;
    if (application.status === 'approved' && !isStrategyComplete) return 2;
    if (isStrategyComplete && upcomingSessions.length === 0) return 3;
    if (upcomingSessions.length > 0) return 4;
    return 5;
  };

  const step = getStatusStep();

  const progressPercentage = currentUser?.milestones 
    ? (currentUser.milestones.filter(m => m.completed).length / currentUser.milestones.length) * 100 
    : 0;

  const [notification, setNotification] = useState<string | null>(null);

  const handleJoinSession = (booking: Booking) => {
    setNotification(`Joining session with Peter Mannarino...\nDate: ${booking.date}\nTime: ${booking.time}\n\nRedirecting to secure video link.`);
    setTimeout(() => {
      window.open('https://meet.google.com/new', '_blank');
      setNotification(null);
    }, 2000);
  };

  const handleDownload = (productName: string) => {
    setNotification(`Starting download: ${productName}.pdf\nPreparing your high-performance resource...`);
    setTimeout(() => setNotification(null), 3000);
  };

  const checkSessionExpiration = () => {
    if (upcomingSessions.length === 0 && pastSessions.length > 0) {
      setNotification('You have no upcoming sessions left. Book more to continue your progress!');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  useEffect(() => {
    checkSessionExpiration();
  }, [upcomingSessions, pastSessions]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-black rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
        <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 pointer-events-none">
          <TrendingUp size={120} className="sm:w-[180px] sm:h-[180px]" />
        </div>
        
        <div className="relative z-10 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 rounded-full border border-white/10">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[7px] sm:text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Growth Velocity</span>
          </div>

          {step >= 3 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Your <br /> Trajectory.</h3>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <span className="text-lg sm:text-xl font-black">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                  <p className="text-[7px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5 sm:mb-1">Tasks Pending</p>
                  <p className="text-lg sm:text-xl font-black">{currentUser?.tasks?.filter(t => t.status === 'pending').length || 0}</p>
                </div>
                <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                  <p className="text-[7px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5 sm:mb-1">Milestones</p>
                  <p className="text-lg sm:text-xl font-black">{currentUser?.milestones?.filter(m => m.completed).length || 0}/{currentUser?.milestones?.length || 0}</p>
                </div>
              </div>
            </div>
          ) : step === 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Start Your <br /> Journey.</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[200px] sm:max-w-[240px]">You haven't applied for mentorship yet. Let's fix your trajectory.</p>
              <button onClick={() => navigate('/apply')} className="btn-compact bg-white text-black w-full flex items-center justify-center gap-2">
                Apply Now <ArrowRight size={14} />
              </button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Under <br /> Review.</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[200px] sm:max-w-[240px]">Peter is auditing your application. We'll notify you shortly.</p>
              <div className="w-full py-4 bg-white/5 border border-white/10 text-white/50 text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] rounded-full flex items-center justify-center gap-3 italic">
                Awaiting Feedback
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none text-white">Identity <br /> Audit.</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[200px] sm:max-w-[240px]">Verified member. Complete your Personal Branding audit to begin your strategic transformation.</p>
              <button 
                onClick={() => navigate('/dashboard/branding')} 
                className="btn-compact bg-amber-400 text-black w-full flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
              >
                Branding Form <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Announcements Feed */}
      {isApproved && announcements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategy Broadcasts</h3>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">Live Feed</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {announcements.map(ann => (
              <div key={ann.id} className="min-w-[280px] sm:min-w-[320px] bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                    ann.priority === 'high' ? 'bg-red-50 text-red-500' : 
                    ann.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {ann.priority} Priority
                  </div>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{formatToNJ(ann.created_at, { month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight leading-tight">{ann.title}</h4>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isApproved && events.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Networking Events</h3>
            <button onClick={() => navigate('/dashboard/networking')} className="text-[8px] font-black uppercase tracking-widest text-black border-b border-black">View All</button>
          </div>
          <div className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">{events[0].title}</h4>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{formatToNJ(events[0].date, { month: 'short', day: 'numeric', year: 'numeric' })} @ {events[0].location}</p>
              </div>
            </div>
            <button 
              onClick={() => onEventAttend(events[0].id)}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                events[0].attendees.includes(currentUser?.id || '') 
                  ? 'bg-emerald-50 text-emerald-500' 
                  : 'bg-black text-white hover:scale-105'
              }`}
            >
              {events[0].attendees.includes(currentUser?.id || '') ? 'Interested' : 'Attend'}
            </button>
          </div>
        </div>
      )}

      {/* Application Status Section */}
      {application && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-black/[0.03] shadow-sm space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Program Status</h3>
            <div className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${
              application.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 
              application.status === 'rejected' ? 'bg-red-50 text-red-500' : 
              'bg-amber-50 text-amber-500'
            }`}>
              {application.status}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Program Type</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl"><Briefcase size={14} className="sm:w-4 sm:h-4 text-black" /></div>
                <p className="text-[10px] sm:text-sm font-black uppercase">{application.mentor_type}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Lead Mentor</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl"><UserIcon size={14} className="sm:w-4 sm:h-4 text-black" /></div>
                <p className="text-[10px] sm:text-sm font-black uppercase">Peter Mannarino</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step >= 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Tasks</h4>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{currentUser?.tasks?.filter(t => t.status === 'pending').length} Remaining</span>
          </div>
          <div className="space-y-3">
            {currentUser?.tasks?.map(task => (
              <div key={task.id} className="bg-white p-5 rounded-[28px] border border-black/[0.03] flex items-center justify-between group hover:border-black/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                    {task.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase">{task.title}</h5>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Due {formatToNJ(task.due_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                {task.status === 'pending' && (
                  <button 
                    onClick={() => onTaskComplete && onTaskComplete(task.id)}
                    className="text-[8px] font-black uppercase tracking-widest text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pinned Resources */}
      {isApproved && resourceLinks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pinned Resources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resourceLinks.filter(rl => rl.is_pinned).map(link => (
              <a 
                key={link.id} 
                href={link.url}
                className="bg-white p-6 rounded-[32px] border border-black/[0.03] flex items-center justify-between group hover:border-black/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                    <Download size={18} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-tight leading-none">{link.title}</h4>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{link.category}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-200 group-hover:text-black transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[450px]">
          {[
            { label: 'Applied', icon: History, active: step >= 1 },
            { label: 'Approved', icon: CheckCircle2, active: step >= 2 },
            { label: 'Booked', icon: Calendar, active: step >= 3 },
            { label: 'Growth', icon: TrendingUp, active: step >= 4 }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${s.active ? 'bg-black text-white shadow-xl scale-110' : 'bg-slate-50 text-slate-300'}`}>
                <s.icon size={16} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${s.active ? 'text-black' : 'text-slate-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => navigate('/dashboard/sessions')} className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-3 cursor-pointer hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all group">
          <div className="p-2.5 bg-slate-50 rounded-xl w-fit group-hover:bg-black group-hover:text-white transition-colors"><Calendar size={16} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calls</p>
          <p className="text-xl font-black">{upcomingSessions.length}</p>
        </div>
        <div onClick={() => navigate('/survey')} className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-3 cursor-pointer hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all group">
          <div className="p-2.5 bg-slate-50 rounded-xl w-fit group-hover:bg-black group-hover:text-white transition-colors"><MessageSquare size={16} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Feedback</p>
          <p className="text-[8px] font-black uppercase text-slate-300">Share Insights</p>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Your Schedule</h3>
        <button onClick={() => navigate('/booking')} className="text-[9px] font-black uppercase tracking-widest text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity">Book Session</button>
      </div>

      {upcomingSessions.length > 0 ? (
        <div className="space-y-4">
          {upcomingSessions.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-[32px] border border-black/[0.03] flex items-center justify-between shadow-sm hover:border-black/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                  <Clock3 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase truncate max-w-[140px]">{formatToNJ(s.date, { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.time} • Strategy</p>
                </div>
              </div>
              <button onClick={() => handleJoinSession(s)} className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all">Join Now</button>
            </div>
          ))}

          {/* Pre-Session Prep Card */}
          <div className="bg-black text-white p-8 sm:p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={80} /></div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-1">
                <h4 className="text-xl font-black uppercase tracking-tighter">Pre-Session Prep</h4>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Maximize your time with Peter</p>
              </div>
              <div className="space-y-3">
                {[
                  'Review last session notes',
                  'Document 3 specific roadblocks',
                  'Identify one strategic "win" from the week'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-lg border border-white/20 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                      <CheckCircle2 size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[11px] font-medium text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setNotification('Downloading Brief Template...'); setTimeout(() => setNotification(null), 3000); }} className="w-full py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Download Brief Template</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border border-dashed border-slate-200">
          <Calendar className="mx-auto text-slate-300 mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No upcoming calls</p>
          <button onClick={() => navigate('/booking')} className="mt-4 px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">Schedule Now</button>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 pt-6">History</h4>
        {pastSessions.map(s => (
          <div key={s.id} className="bg-white/60 p-5 rounded-[24px] border border-black/[0.01] flex items-center justify-between grayscale opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-600">{formatToNJ(s.date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest">Completed</p>
              </div>
            </div>
            <button onClick={() => { setNotification('Opening notes...'); setTimeout(() => setNotification(null), 3000); }} className="text-[8px] font-black uppercase tracking-widest text-slate-400">Notes</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">The Vault</h3>
      </div>

      {isApproved ? (
        <div className="grid grid-cols-1 gap-4">
          {availableResources.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-[32px] border border-black/[0.03] shadow-sm flex items-center justify-between group hover:border-black/10 transition-all">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                  <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={p.name} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black uppercase truncate mb-1">{p.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.category}</p>
                </div>
              </div>
              <button onClick={() => handleDownload(p.name)} className="p-3 bg-slate-50 rounded-full hover:bg-black hover:text-white hover:scale-110 active:scale-90 transition-all">
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border border-dashed border-slate-200">
          <ShieldCheck className="mx-auto text-slate-300 mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">The Vault is Locked</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Access to premium career and performance resources is granted automatically upon application approval.</p>
          {!application && (
            <button onClick={() => navigate('/apply')} className="mt-6 px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Apply for Access</button>
          )}
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-10 pb-20">
      <div className="space-y-2 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Roadmap Audits</h3>
        <h2 className="text-3xl font-black uppercase tracking-tighter">Strategic Plan.</h2>
        <p className="text-slate-400 text-xs font-medium">Submit your professional activities for Peter's executive review.</p>
      </div>

      {taskActivities.length > 0 && (
         <div className="space-y-4">
           <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">Recent Submissions</h4>
           {taskActivities.map(activity => (
             <div key={activity.id} className="bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'reviewed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{activity.status}</span>
                 </div>
                 <span className="text-[8px] font-bold text-slate-400 uppercase">{formatToNJ(activity.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
               </div>
               {activity.admin_response && (
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mentor Feedback</p>
                    <p className="text-[10px] font-medium italic">"{activity.admin_response}"</p>
                 </div>
               )}
             </div>
           ))}
         </div>
      )}

      {application?.status === 'approved' ? (
        <div className="bg-white p-8 md:p-12 rounded-[48px] border border-black/[0.03] shadow-sm">
          <TaskActivityForm onSubmit={onTaskSubmit} userName={currentUser?.name || 'User'} />
        </div>
      ) : (
        <div className="bg-slate-50 p-12 rounded-[48px] text-center border border-dashed border-slate-200">
          <ShieldCheck size={32} className="mx-auto text-slate-300 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locked Feature</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">This task list is only available for mentees whose applications have been verified and approved.</p>
        </div>
      )}
    </div>
  );

  const renderNetworking = () => (
    <div className="space-y-10 pb-20">
      <div className="bg-indigo-600 p-10 rounded-[48px] text-white space-y-6 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Zap size={160} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/50">Stage 04: Market Connection</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Connections.</h2>
          <p className="text-[11px] font-bold leading-relaxed max-w-[280px] text-white/40 uppercase">
             Attend Peter's listed events. Submit reports on who you met and panel takeaways to gain performance points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-8 rounded-[48px] border border-black/[0.03] shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                event.attendees.includes(currentUser?.id || '') ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
              }`}>
                {event.attendees.includes(currentUser?.id || '') ? 'Interested' : 'Open'}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black uppercase tracking-tight">{event.title}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock3 size={12} /> {formatToNJ(event.date, { month: 'short', day: 'numeric', year: 'numeric' })} • {event.time} @ {event.location}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pt-2">{event.description}</p>
            </div>
            <button 
              onClick={() => onEventAttend(event.id)}
              className={`w-full py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                event.attendees.includes(currentUser?.id || '') 
                  ? 'bg-slate-50 text-slate-400 cursor-default' 
                  : 'bg-black text-white hover:scale-105 shadow-xl shadow-black/10'
              }`}
            >
              {event.attendees.includes(currentUser?.id || '') ? 'Marked as Attending' : 'Confirm Attendance'}
            </button>
          </div>
        ))}
        {events.length === 0 && (
          <div className="md:col-span-2 p-12 bg-slate-50 border border-dashed border-slate-200 rounded-[48px] text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No events currently listed by Peter</p>
          </div>
        )}
      </div>

      {isApproved && (
        <div className="bg-white p-2 rounded-[60px] border border-black/[0.03] shadow-sm">
          <div className="p-8 sm:p-12">
            <div className="space-y-2 mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight">Report Networking</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Submit details for who you met & takeaways</p>
            </div>
            <TaskActivityForm 
              onSubmit={onTaskSubmit} 
              userName={currentUser?.name || 'User'} 
              isNetworkingOnly={true} 
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderBranding = () => (
    <div className="space-y-10 pb-20">
      <div className="bg-amber-400 p-10 rounded-[48px] text-black space-y-6 shadow-2xl shadow-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <UserIcon size={160} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-black/5 rounded-full border border-black/5 text-[9px] font-black uppercase tracking-widest text-black/60">Stage 02: Strategic Foundation</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Identity Audit.</h2>
          <p className="text-[11px] font-bold leading-relaxed max-w-[280px] text-black/40 uppercase">
             Review your professional dress code, greeting, resume, and digital presence with Peter.
          </p>
        </div>
      </div>

      {application?.status === 'approved' ? (
        <div className="space-y-8">
           {growthActivity && (
             <div className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${growthActivity.status === 'reviewed' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                    {growthActivity.status === 'reviewed' ? <CheckCircle2 size={24} /> : <Clock3 size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase">{growthActivity.status === 'reviewed' ? 'Audit Evaluated' : 'Audit Pending Review'}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Submitted on {formatToNJ(growthActivity.created_at, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                {growthActivity.admin_response && (
                  <button onClick={() => setNotification(`Peter's Feedback:\n\n"${growthActivity.admin_response}"`)} className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">Read Report</button>
                )}
             </div>
           )}
           
           <div className="bg-white p-8 md:p-12 rounded-[48px] border border-black/[0.03] shadow-sm">
             <TaskActivityForm 
               onSubmit={onTaskSubmit} 
               userName={currentUser?.name || 'User'} 
               isBrandingOnly={true} 
             />
           </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-12 rounded-[48px] text-center border border-dashed border-slate-200">
          <ShieldCheck size={32} className="mx-auto text-slate-300 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locked Feature</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">This branding audit is only available for mentees whose applications have been verified and approved.</p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white text-xl font-black">
          {currentUser?.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-lg font-black uppercase tracking-tight">{currentUser?.name}</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.email}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">My Application</h4>
          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${application?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {application?.status || 'No Application'}
          </span>
        </div>
        {application ? (
          <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
             <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-400 uppercase">Focus Pillar</p>
               <p className="text-[10px] font-black uppercase tracking-tight">{application.pillar}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-400 uppercase">Intent Summary</p>
               <p className="text-[10px] font-medium text-slate-600 italic leading-relaxed">"{application.goals}"</p>
             </div>
          </div>
        ) : (
          <button onClick={() => navigate('/apply')} className="w-full py-4 bg-slate-50 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-white hover:scale-[1.02] active:scale-95 transition-all">Submit Application</button>
        )}
      </div>


      <div className="grid grid-cols-2 gap-4">
        <Link to="/settings" className="bg-white p-5 rounded-[24px] border border-black/[0.03] flex items-center gap-3 hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all">
          <UserIcon size={14} className="text-slate-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
        </Link>
        <button onClick={() => navigate('/contact')} className="bg-white p-5 rounded-[24px] border border-black/[0.03] flex items-center gap-3 hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all">
          <HelpCircle size={14} className="text-slate-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
        </button>
      </div>

      <button onClick={onLogout} className="btn-normal w-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:scale-[1.02]">
        <LogOut size={16} /> Logout Account
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-1000 px-4 md:px-0 bg-transparent">
      <header className="pt-4 space-y-4">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Portal Home</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Hi, <span className="text-slate-300">{currentUser?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome back to your growth journey.</p>
        </div>
      </header>

      <main className="min-h-[50vh] pb-12 md:pb-0 pt-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={renderOverview()} />
              <Route path="/sessions" element={renderSessions()} />
              <Route path="/roadmap" element={renderTasks()} />
              <Route path="/branding" element={renderBranding()} />
              <Route path="/networking" element={renderNetworking()} />
              <Route path="/vault" element={renderResources()} />
              <Route path="/profile" element={renderProfile()} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="pt-10 pb-24 md:pb-12 flex flex-col items-center gap-4 text-center">
         <p className="text-[8px] font-black uppercase tracking-[1em] text-slate-200">Clarity • Performance</p>
         <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Link to="/help" className="hover:text-black transition-colors">Support</Link>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <Link to="/auth" className="hover:text-black transition-colors">Legal</Link>
         </div>
      </footer>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-md animate-in slide-in-from-top-8 duration-500">
          <div className="bg-black text-white p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-start gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Info size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed whitespace-pre-wrap">
                {notification}
              </p>
            </div>
            <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;