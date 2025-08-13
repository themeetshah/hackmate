import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Github, Linkedin, Twitter, Link as LinkIcon, MapPin, Mail, Rss,
  LayoutGrid, Trophy, Code, Briefcase, Settings, UserCheck, CheckCircle
} from 'lucide-react';

// --- Mock Data for a User ---
// You would fetch this data from your API in a real application
const mockUser = {
  name: 'Alex Rivera',
  avatar: 'https://i.pravatar.cc/150?u=alexrivera', // Using a placeholder image service
  headline: 'Full-Stack Developer & AI Enthusiast',
  location: 'San Francisco, CA',
  isAvailable: true,
  bio: "Passionate about building scalable web applications and exploring the frontiers of artificial intelligence. I thrive in collaborative environments and love turning complex problems into elegant solutions. Currently seeking a driven team for the upcoming AI for Good hackathon.",
  email: 'alex.rivera@example.com',
  socials: {
    github: 'https://github.com/alexrivera',
    linkedin: 'https://linkedin.com/in/alexrivera',
    twitter: 'https://twitter.com/alexrivera',
    portfolio: 'https://alexrivera.dev',
  },
  skills: {
    languages: ['JavaScript', 'Python', 'TypeScript', 'SQL'],
    frameworks: ['React', 'Node.js', 'Next.js', 'FastAPI', 'Tailwind CSS'],
    tools: ['Docker', 'Git', 'Figma', 'Vercel', 'PostgreSQL']
  },
  hackathonHistory: [
    { id: 1, name: 'InnovateAI 2024', project: 'CogniAssist', award: '1st Place Winner', team: ['T', 'J', 'S'] },
    { id: 2, name: 'EcoHacks 2023', project: 'GreenRoute', award: 'Best Sustainability Solution', team: ['M', 'L'] },
    { id: 3, name: 'DevPost Global', project: 'CodeCollab', award: 'Top 10 Finalist', team: ['K', 'D', 'R'] },
  ],
  projects: [
    { id: 1, name: 'Real-time Markdown Editor', description: 'A collaborative markdown editor using WebSockets and Next.js.', tags: ['Next.js', 'WebSockets', 'Prisma'], link: '#', image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800' },
    { id: 2, name: 'AI Image Classifier', description: 'A Python-based API to classify images with high accuracy using a pre-trained model.', tags: ['Python', 'FastAPI', 'PyTorch'], link: '#', image: 'https://images.unsplash.com/photo-1696258686454-320842c9243a?q=80&w=800' }
  ]
};

// --- Main Profile Page Component ---
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const SkillPill = ({ skill, category }) => {
    const colors = {
      languages: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      frameworks: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      tools: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    };
    return (
      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${colors[category]}`}>
        {skill}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'hackathons', label: 'Hackathons', icon: Trophy },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Sticky Profile Card) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-4 xl:col-span-3"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:sticky lg:top-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img src={mockUser.avatar} alt={mockUser.name} className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-md" />
                <span className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full border-2 border-white dark:border-gray-800 ${mockUser.isAvailable ? 'bg-green-500' : 'bg-gray-500'}`} title={mockUser.isAvailable ? 'Available for hire' : 'Not available'}></span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{mockUser.name}</h1>
              <p className="text-md text-blue-600 dark:text-blue-400 font-medium">{mockUser.headline}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                <MapPin className="w-4 h-4 mr-1.5"/>
                {mockUser.location}
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mt-6">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg">
                <UserCheck className="w-4 h-4 mr-2" />
                Connect
              </button>
              <button className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center shadow-md hover:shadow-lg">
                <Mail className="w-4 h-4 mr-2" />
                Message
              </button>
            </div>
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Find me on</h3>
              <div className="flex justify-center space-x-4 mt-4">
                <a href={mockUser.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Github/></a>
                <a href={mockUser.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Linkedin/></a>
                <a href={mockUser.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Twitter/></a>
                <a href={mockUser.socials.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><LinkIcon/></a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column (Tabbed Content) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-8 xl:col-span-9"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-2 sm:space-x-4 px-4 sm:px-6">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`relative py-4 px-2 sm:px-3 font-medium text-sm flex items-center transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2"/>
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" layoutId="underline" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About Me</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{mockUser.bio}</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
                    <div className="space-y-4">
                      {Object.entries(mockUser.skills).map(([category, skills]) => (
                        <div key={category}>
                           <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize flex items-center">
                            <Code className="w-5 h-5 mr-2 text-blue-500"/> {category}
                           </h3>
                           <div className="flex flex-wrap gap-2">
                             {skills.map(skill => <SkillPill key={skill} skill={skill} category={category}/>)}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'hackathons' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hackathon History</h2>
                  {mockUser.hackathonHistory.map(hackathon => (
                    <div key={hackathon.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{hackathon.project}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{hackathon.name}</p>
                      </div>
                      <div className="text-right">
                         <p className="flex items-center justify-end text-sm font-medium text-yellow-600 dark:text-yellow-400">
                           <Trophy className="w-4 h-4 mr-1.5"/> {hackathon.award}
                         </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'projects' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Featured Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockUser.projects.map(project => (
                        <a href={project.link} key={project.id} className="block bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
                           <img src={project.image} alt={project.name} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                           <div className="p-4">
                             <h3 className="font-semibold text-gray-800 dark:text-gray-200">{project.name}</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                             <div className="flex flex-wrap gap-2 mt-3">
                               {project.tags.map(tag => (
                                 <span key={tag} className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{tag}</span>
                               ))}
                             </div>
                           </div>
                        </a>
                      ))}
                    </div>
                 </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                   <Settings className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h2>
                   <p className="text-gray-600 dark:text-gray-400">This is where users would edit their profile information.</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default ProfilePage;