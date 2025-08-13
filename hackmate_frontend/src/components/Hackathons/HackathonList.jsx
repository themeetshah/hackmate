import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Trophy, SlidersHorizontal } from 'lucide-react';
import HackathonCard from './HackathonCard';
import axios from 'axios';
import apiClient from '../../api/axios';

const HackathonList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map backend fields to frontend expectations
  const mapHackathon = (h) => ({
    id: h.id,
    title: h.title,
    description: h.description || '',
    image: h.image || '',
    url: h.url || '',
    startDate: h.start_date || h.startDate,
    endDate: h.end_date || h.endDate,
    registrationDeadline: h.registration_deadline || h.registrationDeadline || h.start_date || h.startDate,
    location: h.location || '',
    type: h.is_virtual === true || h.platform === 'mlh' ? 'online' : (h.type || 'in-person'),
    tags: h.tags || [],
    prizePool: h.prize_pool || h.prizePool || '-',
    participants: h.participants || 0,
    maxTeamSize: h.max_team_size || h.maxTeamSize || '-',
    registrationUrl: h.registration_url || h.registrationUrl || h.url,
  });

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/hackathons/');
        let data = res.data;
        if (!Array.isArray(data)) data = [];
        // Map backend fields to frontend expectations
        setHackathons(data.map(mapHackathon));
      } catch (err) {
        setError('Failed to load hackathons.');
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  // Defensive: ensure hackathons is always an array
  const safeHackathons = Array.isArray(hackathons) ? hackathons : [];
  const allTags = Array.from(new Set(safeHackathons.reduce((acc, h) => {
    if (Array.isArray(h.tags)) return acc.concat(h.tags);
    return acc;
  }, [])));

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'online', label: 'Online' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Registration Open' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'live', label: 'Live' },
    { value: 'completed', label: 'Completed' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Start Date' },
    { value: 'prize', label: 'Prize Pool' },
    { value: 'participants', label: 'Participants' },
    { value: 'deadline', label: 'Registration Deadline' }
  ];

  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    const registrationDeadline = new Date(hackathon.registrationDeadline);

    if (now > endDate) return 'completed';
    if (now >= startDate && now <= endDate) return 'live';
    if (now < registrationDeadline) return 'open';
    return 'upcoming';
  };

  const filteredHackathons = safeHackathons
    .filter(hackathon => {
      const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || hackathon.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || getHackathonStatus(hackathon) === selectedStatus;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => hackathon.tags.includes(tag));

      return matchesSearch && matchesType && matchesStatus && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'prize':
          return parseInt(b.prizePool.replace(/[^0-9]/g, '')) - parseInt(a.prizePool.replace(/[^0-9]/g, ''));
        case 'participants':
          return b.participants - a.participants;
        case 'deadline':
          return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
        default:
          return 0;
      }
    });

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedTags([]);
    setSortBy('date');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-lg text-gray-500 dark:text-gray-400">Loading hackathons...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-lg text-red-500 dark:text-red-400">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Hackathons</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Find the perfect hackathon to showcase your skills
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredHackathons.length} hackathons found
          </span>
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
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>Sort by {option.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
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
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedTags.length > 0) && (
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredHackathons.map((hackathon, index) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <HackathonCard
              hackathon={hackathon}
              onApply={(h) => window.open(h.registrationUrl || h.url, '_blank')}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredHackathons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hackathons found</h3>
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

export default HackathonList;
