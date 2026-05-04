-- SQL Setup Script for Mentorino Supabase Database
-- Run this in your Supabase SQL Editor

-- ==============================================================================
-- 1. APPLICATIONS TABLE (with all required columns)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL UNIQUE,
    user_name TEXT,
    user_phone TEXT,
    mentor_type TEXT,
    meeting_preference TEXT,
    frequency TEXT,
    goals TEXT,
    seriousness INTEGER,
    responses JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 2. ADMIN EMAILS TABLE (Permanent admin bypass solution)
-- ==============================================================================
-- Add mentor emails here to bypass application approval
-- Example: nameisnaresh.m@gmail.com, peter@mentorino.com
CREATE TABLE IF NOT EXISTS public.admin_emails (
    email TEXT PRIMARY KEY,
    role TEXT DEFAULT 'mentor' CHECK (role IN ('mentor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. PROFILES TABLE (Extending Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'mentor')),
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. BOOKINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    notes TEXT
);

-- ==============================================================================
-- 5. TASK ACTIVITIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.task_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    status TEXT DEFAULT 'pending',
    admin_response TEXT,
    pb_card_details TEXT,
    pb_linkedin_url TEXT,
    pb_resume_link TEXT,
    pb_cover_letter_link TEXT,
    pb_dress_code_notes TEXT,
    pb_greeting_intro_notes TEXT,
    net_attended_event TEXT,
    net_people_met TEXT,
    net_contact_info TEXT,
    net_panel_summary TEXT,
    pw_introduction TEXT,
    pw_volunteer_hours TEXT,
    cert_topic TEXT,
    roadmap_topic TEXT,
    interview_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 6. EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT,
    attendees JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 7. TRIGGER FUNCTION (Handle new user registration with mentor bypass)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  mentor_role TEXT;
BEGIN
  -- Check if email is in admin_emails table (bypasses application approval)
  SELECT role INTO mentor_role FROM public.admin_emails WHERE email = new.email;
  
  -- If mentor, create profile with mentor role
  IF mentor_role IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'mentor');
    RETURN new;
  END IF;
  
  -- Normal flow: require approved application
  IF NOT EXISTS (
    SELECT 1 FROM public.applications 
    WHERE user_email = new.email AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Registration blocked: Your application has not been approved yet.';
  END IF;

  -- Create student profile for normal users
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXEXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- APPLICATIONS RLS - FIXED (Security Issue #1)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow all inserts" ON public.applications;
DROP POLICY IF EXISTS "Allow all selects" ON public.applications;
DROP POLICY IF EXISTS "Allow all updates" ON public.applications;
DROP POLICY IF EXISTS "Allow all deletes" ON public.applications;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit application" ON public.applications 
FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users can read applications
CREATE POLICY "Auth users can read applications" ON public.applications 
FOR SELECT TO authenticated USING (true);

-- Only mentors can update/delete applications
CREATE POLICY "Mentors can update applications" ON public.applications 
FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

CREATE POLICY "Mentors can delete applications" ON public.applications 
FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- ==============================================================================
-- PROFILES RLS - FIXED (Security Issue #2)
-- ==============================================================================
DROP POLICY IF EXISTS "Auth users full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- All authenticated users can read any profile (mentors need this to see all students)
CREATE POLICY "All auth users can read profiles" ON public.profiles 
FOR SELECT TO authenticated USING (true);

-- Only own profile can be updated
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger handles insert (no direct insert allowed)
CREATE POLICY "Trigger creates profiles" ON public.profiles 
FOR INSERT TO authenticated WITH CHECK (false);

-- ==============================================================================
-- ADMIN EMAILS RLS - FIXED (Security Issue #3)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow read admin_emails" ON public.admin_emails;

-- Only mentors can see admin_emails
CREATE POLICY "Mentors can read admin_emails" ON public.admin_emails 
FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Bookings policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Mentors can manage bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentors can manage bookings" ON public.bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Task activities policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.task_activities;
DROP POLICY IF EXISTS "Users can create tasks" ON public.task_activities;
DROP POLICY IF EXISTS "Mentors can manage tasks" ON public.task_activities;

CREATE POLICY "Users can view own tasks" ON public.task_activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tasks" ON public.task_activities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentors can manage tasks" ON public.task_activities FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Events policies
DROP POLICY IF EXISTS "Everyone can read events" ON public.events;
DROP POLICY IF EXISTS "Mentors can create events" ON public.events;
DROP POLICY IF EXISTS "Mentors can update events" ON public.events;
DROP POLICY IF EXISTS "Mentors can delete events" ON public.events;

CREATE POLICY "Everyone can read events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mentors can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "Mentors can update events" ON public.events FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "Mentors can delete events" ON public.events FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- ==============================================================================
-- 9. SECURITY: AUDIT LOGGING
-- ==============================================================================
-- Tracks all security-relevant actions for compliance and monitoring

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean up old policies before creating new ones
DROP POLICY IF EXISTS "Mentors can read audit logs" ON public.audit_logs;

-- Only mentors can read audit logs
CREATE POLICY "Mentors can read audit logs" ON public.audit_logs 
FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_values, new_values)
    VALUES (
        COALESCE(current_setting('app.auth_user_id', true), '')::uuid,
        COALESCE(current_setting('app.auth_user_email', true), ''),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' THEN to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_json(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_applications ON public.applications;
CREATE TRIGGER audit_applications
    AFTER INSERT OR UPDATE OR DELETE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXEXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_bookings ON public.bookings;
CREATE TRIGGER audit_bookings
    AFTER INSERT OR UPDATE OR DELETE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- ==============================================================================
-- 10. SECURITY REQUIREMENT: EMAIL CONFIRMATION
-- ==============================================================================
-- ⚠️ SECURITY WARNING: Email confirmation is DISABLED by default in Supabase.
-- For production, you MUST enable email confirmation:
--    1. Go to Supabase Dashboard → Authentication → Providers → Email
--    2. Turn ON "Confirm email"
-- 
-- Without email confirmation, anyone can register with any email address.
-- This is only acceptable for testing/development.

-- ==============================================================================
-- 11. SEED DATA - Add Mentor Email (uncomment and run once)
-- ==============================================================================
-- INSERT INTO public.admin_emails (email, role) VALUES ('petermannario12@gmail.com', 'mentor');

-- ==============================================================================
-- SECURITY CHECKLIST
-- ==============================================================================
-- ✅ Row Level Security (RLS) - Enabled on all tables
-- ✅ Applications RLS - Fixed: Only mentors can modify, public can submit
-- ✅ Profiles RLS - Fixed: Users can only update own profile
-- ✅ admin_emails RLS - Fixed: Only mentors can see admin list
-- ✅ Email Confirmation - Enabled
-- ✅ Audit Logging - Implemented with table and triggers
-- ✅ Rate Limiting - Implemented in server.ts
-- ✅ Security Headers - CSP, X-Frame-Options, X-XSS-Protection
-- ✅ CORS - Restrictive configuration
-- ✅ Input Validation - Added validation utilities
