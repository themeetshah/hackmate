import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Filter, Search, SlidersHorizontal, Target, Zap } from 'lucide-react';
import ParticipantCard from './ParticipantCard';
import { mockParticipants } from '../../data/mockData';

const MatchingPage = () => {
  const [view, setView] = useState('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allSkills = Array.from(new Set(mockParticipants.flatMap(p => p.skills)));
  
  const experienceOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const filteredParticipants = mockParticipants
    .filter(participant => {
      const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.bio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkills = selectedSkills.length === 0 || 
                           selectedSkills.some(skill => participant.skills.includes(skill));
      const matchesExperience = experienceFilter === 'all' || participant.experience === experienceFilter;
      const matchesLocation = !locationFilter || 
                             participant.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesSkills && matchesExperience && matchesLocation;
    })
    .sort((a, b) => view === 'matches' ? b.compatibility - a.compatibility : 0);

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setExperienceFilter('all');
    setLocationFilter('');
  };

  const bestMatches = filteredParticipants.filter(p => p.compatibility >= 80);
  const goodMatches = filteredParticipants.filter(p => p.compatibility >= 60 && p.compatibility < 80);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Perfect Teammates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover talented individuals who complement your skills
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('matches')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                view === 'matches'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Best Matches
            </button>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                view === 'all'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              All Participants
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap lg:flex-nowrap gap-4">
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {experienceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Skills
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              
              {(searchTerm || selectedSkills.length > 0 || experienceFilter !== 'all' || locationFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {view === 'matches' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {bestMatches.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-green-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Perfect Matches ({bestMatches.length})
                </h2>
                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                  80%+ Compatibility
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {bestMatches.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ParticipantCard 
                      participant={participant}
                      onInvite={(p) => console.log('Invite:', p.name)}
                      onMessage={(p) => console.log('Message:', p.name)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {goodMatches.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Good Matches ({goodMatches.length})
                </h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  60%+ Compatibility
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {goodMatches.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ParticipantCard 
                      participant={participant}
                      onInvite={(p) => console.log('Invite:', p.name)}
                      onMessage={(p) => console.log('Message:', p.name)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {view === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Participants ({filteredParticipants.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ParticipantCard 
                  participant={participant}
                  onInvite={(p) => console.log('Invite:', p.name)}
                  onMessage={(p) => console.log('Message:', p.name)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {filteredParticipants.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No participants found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MatchingPage;