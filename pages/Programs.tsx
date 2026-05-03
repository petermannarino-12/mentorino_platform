
import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Database, 
  Layers, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Programs = () => {
  const navigate = useNavigate();

  const programs = [
    {
      id: 'fullstack',
      title: 'Full Stack Development',
      description: 'Master modern web development from frontend to backend using React, Node.js, and Cloud architectures.',
      icon: <Globe className="w-6 h-6" />,
      duration: '24 Weeks',
      level: 'Intermediate',
      topics: ['React & Next.js', 'Node.js & Express', 'PostgreSQL', 'Cloud Deployment'],
      color: 'bg-blue-500'
    },
    {
      id: 'datascience',
      title: 'Data Science & AI',
      description: 'Learn to extract insights from data and build predictive models using Python, SQL, and Machine Learning libraries.',
      icon: <BarChart3 className="w-6 h-6" />,
      duration: '20 Weeks',
      level: 'Advanced',
      topics: ['Python Analysis', 'Machine Learning', 'Data Visualization', 'Deep Learning'],
      color: 'bg-emerald-500'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Analyst',
      description: 'Protect systems and networks from digital attacks. Master ethical hacking, networking security, and compliance.',
      icon: <ShieldCheck className="w-6 h-6" />,
      duration: '18 Weeks',
      level: 'Beginner to Intermediate',
      topics: ['Network Security', 'Ethical Hacking', 'Digital Forensics', 'Incident Response'],
      color: 'bg-purple-500'
    },
    {
      id: 'uiux',
      title: 'UI/UX Design Strategy',
      description: 'Create beautiful, user-centered digital products. Master Figma, user research, and interactive prototyping.',
      icon: <Layers className="w-6 h-6" />,
      duration: '12 Weeks',
      level: 'Beginner',
      topics: ['User Research', 'Figma Mastery', 'Design Systems', 'Interactive Prototyping'],
      color: 'bg-rose-500'
    },
    {
      id: 'cloud',
      title: 'Cloud Engineering',
      description: 'Build and manage scalable infrastructure on AWS, Azure, and GCP. Master Docker, Kubernetes, and Terraform.',
      icon: <Cpu className="w-6 h-6" />,
      duration: '16 Weeks',
      level: 'Advanced',
      topics: ['AWS/Azure Services', 'Docker & K8s', 'IaC (Terraform)', 'CI/CD Pipelines'],
      color: 'bg-orange-500'
    },
    {
      id: 'backend',
      title: 'Backend Systems',
      description: 'Design robust server-side architectures, large-scale databases, and high-performance microservices.',
      icon: <Terminal className="w-6 h-6" />,
      duration: '16 Weeks',
      level: 'Intermediate',
      topics: ['Go & Rust', 'System Design', 'Microservices', 'Distributed Systems'],
      color: 'bg-slate-700'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black mb-8 sm:mb-12 transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>
        
        {/* Header Section */}
        <div className="max-w-3xl mb-12 sm:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-50 px-3 py-1 rounded-full mb-4 sm:mb-6 inline-block">
              Curated Learning Paths
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 mb-4 sm:mb-6 leading-[0.9]">
              Specialized <br className="hidden sm:block"/>
              <span className="text-slate-400 italic">Academy Programs</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-500 font-medium leading-relaxed">
              Mentorship-first programs designed for industry-ready proficiency.
            </p>
          </motion.div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${program.color} text-white rounded-xl sm:rounded-[22px] flex items-center justify-center mb-6 sm:mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                {program.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{program.duration}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{program.level}</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-3 sm:mb-4 group-hover:text-black transition-colors">
                  {program.title}
                </h3>
                
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
                  {program.description}
                </p>
                
                <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10">
                  {program.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-bold text-slate-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => navigate('/apply')}
                className="btn-compact w-full py-3.5 sm:py-4 bg-slate-50 group-hover:bg-black group-hover:text-white text-slate-900 flex items-center justify-center gap-2"
              >
                Enroll Now
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-500" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-32 p-8 sm:p-16 bg-black rounded-[40px] sm:rounded-[64px] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-24 -mt-24 sm:-mr-32 sm:-mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full -ml-32 -mb-32 sm:-ml-48 sm:-mb-48 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter mb-4 sm:mb-6">
              Not sure which track fits?
            </h2>
            <p className="text-white/60 mb-8 sm:mb-10 text-sm sm:text-lg">
              Book a free discovery session with our career mentors.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/booking')}
                className="btn-normal bg-white text-black px-8 sm:px-10 py-4 sm:py-5"
              >
                Talk to a Mentor
              </button>
            </div>
          </div>
        </motion.div>
        <Footer />
      </div>
    </div>
  );
};

export default Programs;
