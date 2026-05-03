
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ScrollToTop from './components/ScrollToTop';
import { useApplications } from './src/hooks/useApplications';
import { useBookings } from './src/hooks/useBookings';
import { useTasks } from './src/hooks/useTasks';
import { useEvents } from './src/hooks/useEvents';
import { Toaster } from 'sonner';
import { useAuth } from './src/contexts/AuthContext';
import Layout from './components/Layout';

// Lazy load pages for better performance and smaller bundle sizes
const LandingPage = lazy(() => import('./pages/Landing'));
const ApplicationPage = lazy(() => import('./pages/Application'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const BookingPage = lazy(() => import('./pages/Booking'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const SurveyPage = lazy(() => import('./pages/Survey'));
const AuthPage = lazy(() => import('./pages/Auth'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const AboutPage = lazy(() => import('./pages/About'));
const ProgramsPage = lazy(() => import('./pages/Programs'));
const GrowthFormPage = lazy(() => import('./pages/GrowthForm'));
const ConsultationOverviewPage = lazy(() => import('./pages/ConsultationOverview'));
const FAQPage = lazy(() => import('./pages/FAQ'));
const ContactPage = lazy(() => import('./pages/Contact'));
const TermsPage = lazy(() => import('./pages/Terms'));
const PrivacyPage = lazy(() => import('./pages/Privacy'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));

import { getNJISOString } from './src/lib/dateUtils';
import { supabase } from './src/lib/supabase';
import { User, UserRole, Application, Booking, TaskActivity, NetworkEvent } from './types';

const AnimatedRoutes: React.FC<{
  currentRole: UserRole;
  currentUser: User | null;
  applications: Application[];
  users: User[];
  bookings: Booking[];
  taskActivities: TaskActivity[];
  events: NetworkEvent[];
  addApplication: (app: Application) => void;
  updateApplicationStatus: (id: string, status: any) => void;
  deleteApplication: (id: string) => void;
  addTaskActivity: (activity: any) => void;
  updateTaskActivityStatus: (id: string, status: any, response?: string) => void;
  onTaskComplete?: (taskId: string) => void;
  handleAddEvent: (event: NetworkEvent) => void;
  handleDeleteEvent: (id: string) => void;
  handleEventAttend: (eventId: string) => void;
  handleLogout: () => void;
  handleLogin: (user: User) => void;
  fetchData: () => void;
  addBooking: (booking: Booking) => void;
}> = ({ 
  currentRole, currentUser, applications, users, bookings, taskActivities, events, 
  addApplication, updateApplicationStatus, deleteApplication, addTaskActivity, 
  updateTaskActivityStatus, onTaskComplete, handleAddEvent, handleDeleteEvent, handleEventAttend, 
  handleLogout, handleLogin, fetchData, addBooking
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage currentRole={currentRole} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/growth-strategy" element={<GrowthFormPage />} />
          <Route path="/consultation" element={<ConsultationOverviewPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          
          <Route path="/apply" element={
            <ApplicationPage onApply={addApplication} existingApp={applications.find(a => a.user_email === currentUser?.email)} />
          } />
          
          <Route path="/auth" element={
            currentRole !== 'visitor' ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />
          } />
          
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/dashboard/*" element={
            currentRole === 'mentor' ?
              <MentorDashboard 
                currentUser={currentUser} 
                applications={applications} 
                bookings={bookings} 
                users={users} 
                taskActivities={taskActivities}
                events={events}
                onUpdateTaskActivity={updateTaskActivityStatus}
                onUpdateApplication={updateApplicationStatus}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onLogout={handleLogout} 
                onRefresh={fetchData}
              /> :
            currentRole === 'student' ? 
              <UserDashboard currentUser={currentUser} application={applications.find(a => a.user_email === currentUser?.email)} bookings={bookings.filter(b => b.user_id === currentUser?.id)} taskActivities={taskActivities.filter(t => t.user_id === currentUser?.id)} events={events} onTaskSubmit={addTaskActivity} onTaskComplete={onTaskComplete} onEventAttend={handleEventAttend} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
          } />

          <Route path="/mentor/applications" element={
            currentRole === 'mentor' ? <Navigate to="/dashboard?tab=mentees" /> : <Navigate to="/dashboard" />
          } />

          <Route path="/booking" element={
            currentRole === 'visitor' ? <Navigate to="/auth" /> : <BookingPage onBook={addBooking} currentUser={currentUser} />
          } />

          <Route path="/settings" element={
            currentRole === 'visitor' ? <Navigate to="/auth" /> : <SettingsPage onLogout={handleLogout} currentUser={currentUser} />
          } />

          <Route path="/survey" element={
            currentRole === 'visitor' ? <Navigate to="/auth" /> : <SurveyPage />
          } />

          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const { user: currentUser, role: currentRole, authLoading, signOut: handleLogout } = useAuth();
  
  const { 
    applications, 
    loading: appsLoading, 
    addApplication, 
    updateStatus: updateApplicationStatus, 
    deleteApplication, 
    refresh: refreshApps 
  } = useApplications();
  
  const { 
    bookings, 
    loading: bksLoading, 
    addBooking, 
    refresh: refreshBookings 
  } = useBookings();
  
  const { 
    taskActivities, 
    loading: tasksLoading, 
    addTask: addTaskActivity, 
    updateStatus: updateTaskActivityStatus, 
    refresh: refreshTasks 
  } = useTasks();
  
  const { 
    events, 
    loading: evtsLoading, 
    addEvent: handleAddEvent, 
    deleteEvent: handleDeleteEvent, 
    attendEvent: handleEventAttend, 
    refresh: refreshEvents 
  } = useEvents();

  const [users, setUsers] = useState<User[]>([]);
  
  const fetchData = async () => {
      await Promise.all([refreshApps(), refreshBookings(), refreshTasks(), refreshEvents()]);
      if (currentRole === 'mentor') {
        const { data: profiles } = await supabase.from('profiles').select('*');
        // Map profiles to standard User objects
        const mappedUsers: User[] = (profiles || []).map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          created_at: p.created_at
        }));
        setUsers(mappedUsers);
      }
  };

  const handleTaskComplete = async (taskId: string) => {
    if (!currentUser) return;
    const { data: profile } = await supabase.from('profiles').select('tasks').eq('id', currentUser.id).single();
    if (profile && profile.tasks) {
      const updatedTasks = profile.tasks.map((t: any) => t.id === taskId ? { ...t, status: 'completed' } : t);
      await supabase.from('profiles').update({ tasks: updatedTasks }).eq('id', currentUser.id);
      await refreshTasks(); // refresh app state
    }
  };

  const handleLogin = (user: User) => {
    // Session listener handles state
  };
    
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster richColors position="top-right" />
      <ScrollToTop />
      <Layout role={currentRole} onLogout={handleLogout}>
        <Suspense fallback={
          <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <AnimatedRoutes 
            currentRole={currentRole} 
            currentUser={currentUser} 
            applications={applications} 
            users={users} 
            bookings={bookings} 
            taskActivities={taskActivities} 
            events={events} 
            addApplication={addApplication} 
            updateApplicationStatus={updateApplicationStatus} 
            deleteApplication={deleteApplication} 
            addTaskActivity={addTaskActivity} 
            updateTaskActivityStatus={updateTaskActivityStatus} 
            onTaskComplete={handleTaskComplete}
            handleAddEvent={handleAddEvent} 
            handleDeleteEvent={handleDeleteEvent} 
            handleEventAttend={handleEventAttend} 
            handleLogout={handleLogout} 
            handleLogin={handleLogin}
            fetchData={fetchData} 
            addBooking={addBooking}
          />
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
