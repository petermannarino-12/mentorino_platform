import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  Search,
  Bell,
  MoreVertical,
  Filter,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  PlusCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Application, Booking, TaskActivity, NetworkEvent } from '../types';
import { formatToNJ } from '../src/lib/dateUtils';

interface MentorDashboardProps {
  currentUser: User | null;
  applications: Application[];
  bookings: Booking[];
  users: User[];
  taskActivities: TaskActivity[];
  events: NetworkEvent[];
  onUpdateTaskActivity: (id: string, status: 'pending' | 'reviewed', response?: string) => void;
  onUpdateApplication: (id: string, status: 'approved' | 'rejected' | 'pending') => void;
  onAddEvent: (event: NetworkEvent) => void;
  onDeleteEvent: (id: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
}

type MentorTab = 'overview' | 'mentees' | 'sessions' | 'feedback' | 'applications' | 'events';

const MentorDashboard: React.FC<MentorDashboardProps> = ({ 
  currentUser, 
  applications, 
  bookings, 
  users, 
  taskActivities,
  events,
  onUpdateTaskActivity,
  onUpdateApplication,
  onAddEvent,
  onDeleteEvent,
  onLogout,
  onRefresh
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MentorTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskActivity | null>(null);
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // New Event Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    location: ''
  });

  const handleStartCall = (session: Booking) => {
    setNotification(`Starting session with ${session.user_name}... \nRedirecting to secure video link.`);
    setTimeout(() => {
      window.open('https://meet.google.com/new', '_blank');
      setNotification(null);
    }, 2000);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') as MentorTab;
    if (tab && ['overview', 'mentees', 'sessions', 'feedback'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Data helpers
  const mentees = applications.filter(app => app.status === 'approved');
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const mentorBookings = bookings.filter(b => b.status === 'upcoming'); // In a real app, filter by mentor_id
  const pendingTasks = taskActivities.filter(t => t.status === 'pending');

  const stats = [
    { label: 'Active Mentees', value: mentees.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Upcoming Sessions', value: mentorBookings.length, icon: Calendar, color: 'bg-emerald-500' },
    { label: 'Pending Reviews', value: pendingTasks.length, icon: CheckCircle, color: 'bg-purple-500' },
    { label: 'Network Reach', value: '14 Countries', icon: TrendingUp, color: 'bg-amber-500' },
  ];

  const handleReviewTask = (task: TaskActivity) => {
    setSelectedTask(task);
    setFeedbackResponse(task.admin_response || '');
  };

  const handleApplicationAction = async (id: string, status: 'approved' | 'rejected') => {
    onUpdateApplication(id, status);
    setNotification(`Application ${status} successfully.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.location) return;
    
    const event: NetworkEvent = {
      id: crypto.randomUUID(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      attendees: [],
      created_at: new Date().toISOString()
    };

    onAddEvent(event);
    setIsAddingEvent(false);
    setNewEvent({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '18:00', location: '' });
    setNotification('New networking event published.');
    setTimeout(() => setNotification(null), 3000);
  };

  const submitFeedback = () => {
    if (selectedTask) {
      onUpdateTaskActivity(selectedTask.id, 'reviewed', feedbackResponse);
      setSelectedTask(null);
      setFeedbackResponse('');
      onRefresh();
    }
  };

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Mentor's Strategic Feed */}
      <div className="bg-black text-white p-10 rounded-[50px] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <TrendingUp size={160} />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest">
              Growth Intelligence
            </div>
            <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-tight">Mentees are reaching <br /> milestones 20% faster.</h3>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">System-wide performance increase due to new "Performance Audit" framework implementation.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Avg. Goal Clarity', val: '9.2/10' },
              { label: 'Session Velocity', val: '+14%' },
              { label: 'Retention Rate', val: '98%' },
              { label: 'Success Score', val: 'A+' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-xl font-black">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Strategic Audits */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Task Reviews Pending</h3>
            <button onClick={() => setActiveTab('feedback')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {pendingTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {task.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{task.user_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                      {task.roadmap_topic || task.cert_topic || 'Identity Audit'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleReviewTask(task)}
                  className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full"
                >
                  Review
                </button>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* New Applicants Review */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Pending Lead Audits</h3>
            <button onClick={() => setActiveTab('applications')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {pendingApplications.slice(0, 3).map((app) => (
              <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black">
                    {app.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 leading-none">{app.user_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{app.mentor_type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApplicationAction(app.id, 'rejected')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"><X size={16} /></button>
                  <button onClick={() => handleApplicationAction(app.id, 'approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"><CheckCircle2 size={16} /></button>
                </div>
              </div>
            ))}
            {pendingApplications.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No new applicants</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderMentees = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search mentees by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all text-sm"
          />
        </div>
        <button onClick={() => { setNotification('Advanced filters opened.'); setTimeout(() => setNotification(null), 3000); }} className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
          <Filter size={16} />
          <span>Advanced Filter</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Trajectory Data</th>
                <th className="px-8 py-5">Program</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mentees.filter(m => m.user_name.toLowerCase().includes(searchQuery.toLowerCase())).map((mentee) => (
                <tr key={mentee.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm">
                        {mentee.user_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900 uppercase tracking-tight">{mentee.user_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{mentee.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {mentee.mentor_type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => { setNotification('Messaging interface opening...'); setTimeout(() => setNotification(null), 3000); }} className="p-2 text-slate-400 hover:text-black transition-colors">
                          <MessageSquare size={18} />
                       </button>
                       <button onClick={() => { setNotification('More options opened.'); setTimeout(() => setNotification(null), 3000); }} className="p-2 text-slate-400 hover:text-black transition-colors">
                          <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderFeedback = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Task List */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 lg:mb-4">Pending Strategic Audits</h3>
        <div className="space-y-3">
          {pendingTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => handleReviewTask(task)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer ${selectedTask?.id === task.id ? 'bg-black text-white border-black shadow-xl translate-x-2' : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'}`}
            >
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-2">
                {formatToNJ(task.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <h4 className="font-black uppercase tracking-tight mb-1">{task.user_name}</h4>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedTask?.id === task.id ? 'text-white/60' : 'text-slate-400'}`}>
                {task.roadmap_topic || 'Identity Audit'}
              </p>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <div className="p-12 bg-slate-50 rounded-3xl text-center border-2 border-dashed border-slate-200">
               <CheckCircle size={32} className="mx-auto mb-4 text-slate-300" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No pending audits</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Area */}
      <div className="lg:col-span-2">
        {selectedTask ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Strategic Audit Review</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auditing {selectedTask.user_name}'s Submission</p>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
              >
                <MoreVertical size={20} className="rotate-90" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Submission Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedTask.pb_card_details && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">LinkedIn / Professional URL</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-medium truncate flex-1">{selectedTask.pb_linkedin_url || 'Not provided'}</p>
                      {selectedTask.pb_linkedin_url && <ExternalLink size={14} className="text-slate-400" />}
                    </div>
                  </div>
                )}
                {selectedTask.roadmap_topic && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Strategy Focus</p>
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-black uppercase">{selectedTask.roadmap_topic}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Submission Summary</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-3xl italic">
                    "{selectedTask.net_panel_summary || selectedTask.cert_topic || selectedTask.pb_card_details || 'Internal Audit Submission'}"
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Mentor Executive Response</p>
                  <textarea 
                    value={feedbackResponse}
                    onChange={(e) => setFeedbackResponse(e.target.value)}
                    placeholder="Provide your high-level feedback and next steps for the mentee..."
                    className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 text-indigo-500">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitFeedback}
                  className="px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                  Approve & Release
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[60px] border-2 border-dashed border-slate-200 text-center px-12">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <MessageSquare size={32} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Select an audit to review</h3>
            <p className="text-slate-400 max-w-sm mt-3 text-sm leading-relaxed">
              Choose a mentee submission from the left panel to begin your executive review and provide trajectory guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingApplications.map(app => (
          <div key={app.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm space-y-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl">
                {app.user_name.charAt(0)}
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest italic">New Inquiry</span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xl font-black uppercase tracking-tight">{app.user_name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.user_email}</p>
              <div className="pt-4 space-y-3">
                 <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Mentor Seeking</p>
                   <p className="text-[10px] font-black uppercase tracking-tight">{app.mentor_type}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Main Goal</p>
                   <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">"{app.goals}"</p>
                 </div>
              </div>
            </div>

            <div className="pt-6 mt-auto flex items-center gap-3">
              <button 
                onClick={() => handleApplicationAction(app.id, 'rejected')} 
                className="flex-1 py-4 border-2 border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
              >
                Decline
              </button>
              <button 
                onClick={() => handleApplicationAction(app.id, 'approved')} 
                className="flex-1 py-4 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                Approve Lead
              </button>
            </div>
          </div>
        ))}
        {pendingApplications.length === 0 && (
          <div className="lg:col-span-3 p-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
             <Users className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">No pending applications</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderEvents = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
         <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Networking Catalog</h2>
         <button 
          onClick={() => setIsAddingEvent(true)}
          className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2"
         >
           <PlusCircle size={14} /> Create Event
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                <Calendar size={24} />
              </div>
              <div>
                 <h4 className="text-lg font-black uppercase tracking-tight mb-1">{event.title}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.date} @ {event.location}</p>
                 <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                   <Users size={12} /> {event.attendees.length} Students Attending
                 </p>
              </div>
            </div>
            <button 
              onClick={() => onDeleteEvent(event.id)}
              className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <LogOut className="rotate-180" size={20} />
            </button>
          </div>
        ))}
        {events.length === 0 && (
          <div className="md:col-span-2 p-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[50px]">
             <Calendar className="mx-auto text-slate-200 mb-4" size={40} />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No events currently active</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddingEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg p-10 rounded-[48px] shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-black">List Networking Event</h3>
                <button onClick={() => setIsAddingEvent(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-black"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="E.g. NY Tech Week Panel"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <input 
                      type="time" 
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Link</label>
                  <input 
                    type="text" 
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="E.g. Javits Center, NYC"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</label>
                  <textarea 
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="What should students prep for?"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black min-h-[80px]"
                  />
                </div>
              </div>

              <button 
                onClick={handleCreateEvent}
                className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Publish Broadcast
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-8">
      <div className="bg-black rounded-[50px] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <Calendar size={220} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 uppercase tracking-[0.2em] text-[9px] font-black">
            Executive Schedule
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Your Live <br /> Engagement.</h2>
          <h1 className="text-white/40 text-sm max-w-md font-medium">Manage your 1-on-1 strategy sessions with all active mentees globally.</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 px-4">Today & Upcoming</h3>
          <div className="space-y-4">
            {mentorBookings.map(session => (
              <div key={session.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between group hover:border-black/10 hover:shadow-xl hover:shadow-black/5 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-50 text-black rounded-3xl flex flex-col items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <span className="text-[10px] font-black uppercase mb-1">{formatToNJ(session.date, { month: '2-digit' })}</span>
                    <span className="text-2xl font-black leading-none">{formatToNJ(session.date, { day: '2-digit' })}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">{session.user_name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={12} /> {session.time} • Strategy Session
                    </p>
                  </div>
                </div>
                <button onClick={() => handleStartCall(session)} className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">
                   Start Call
                </button>
              </div>
            ))}
            {mentorBookings.length === 0 && (
              <div className="p-20 bg-slate-50 rounded-[40px] text-center border-2 border-dashed border-slate-200">
                <Calendar size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Clear Schedule</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-black/[0.03] p-10 space-y-8 h-fit">
           <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">Availability Management</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Timezone Sync Active</p>
           </div>
           
           <div className="space-y-4">
              {['Monday', 'Wednesday', 'Friday'].map(day => (
                <div key={day} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="text-sm font-black uppercase">{day}</span>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-500">09:00 - 17:00</span>
                      <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                         <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <button onClick={() => { setNotification('Office hours updated.'); setTimeout(() => setNotification(null), 3000); }} className="w-full py-5 border-2 border-black text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all">
              Update Office Hours
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FDFDFD] flex flex-col min-h-screen">
      {/* Header for Tablet/Desktop */}
      <header className="hidden lg:flex items-center justify-between py-8 px-12 bg-white border-b border-slate-50 sticky top-0 z-30">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Mentor Console</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
             {activeTab === 'overview' ? 'Overview' : activeTab === 'mentees' ? 'Active Mentees' : activeTab === 'sessions' ? 'Schedule' : activeTab === 'applications' ? 'Inquiry Audit' : activeTab === 'events' ? 'Networking Setup' : 'Management Audit'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Sync</span>
          </div>
          <button onClick={() => { setNotification('No new notifications.'); setTimeout(() => setNotification(null), 3000); }} className="p-3 text-slate-400 hover:text-black transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
          </button>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-black uppercase tracking-tight leading-none mb-0.5">{currentUser?.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Growth Lead</p>
            </div>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm">
              {currentUser?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'mentees' && renderMentees()}
            {activeTab === 'sessions' && renderSessions()}
            {activeTab === 'feedback' && renderFeedback()}
            {activeTab === 'applications' && renderApplications()}
            {activeTab === 'events' && renderEvents()}
          </motion.div>
        </AnimatePresence>
      </main>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black text-white p-6 rounded-3xl shadow-2xl z-[200] animate-in slide-in-from-top-4 duration-500 border border-white/10 whitespace-pre-wrap">
           <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500 text-white rounded-xl"><Info size={20} /></div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Notification</p>
                <p className="text-[11px] font-medium leading-relaxed opacity-70">{notification}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
