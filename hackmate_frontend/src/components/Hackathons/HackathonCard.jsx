import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Users, Trophy, Clock, ExternalLink,
  Star, Zap, ArrowRight, CheckCircle, CreditCard,
  Globe, Monitor, MapIcon, DollarSign, Timer, Loader,
  IndianRupee,
  ListEnd
} from 'lucide-react';
import { format, formatDistance, parseISO } from 'date-fns';

const HackathonCard = ({
  hackathon,
  onApply,
  onViewDetails,
  userApplied = false,
  applicationStatus = null,
  isApplying = false,
  isOrganizer = false
}) => {
  // Get current time in local timezone
  const now = new Date();

  // Date objects for comparisons
  const startDate = parseISO(hackathon.start_date);
  const endDate = parseISO(hackathon.end_date);
  const registrationStart = parseISO(hackathon.registration_start);
  const registrationEnd = parseISO(hackathon.registration_end);

  // Banner image state
  const [bannerImage, setBannerImage] = useState(
    `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/media/hackathons/banners/placeholder-image.jpg`
  );

  // Update banner image when hackathon.banner_image changes
  useEffect(() => {
    if (!hackathon.banner_image) {
      setBannerImage(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/media/hackathons/banners/placeholder-image.jpg`);
    } else if (hackathon.banner_image.startsWith('http')) {
      setBannerImage(hackathon.banner_image);
    } else if (hackathon.banner_image.startsWith('/media/')) {
      setBannerImage(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${hackathon.banner_image}`);
    } else {
      setBannerImage(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/media/${hackathon.banner_image}`);
    }
  }, [hackathon.banner_image]);

  // Status logic
  const getStatus = () => {
    if (now > endDate) return {
      label: 'Completed',
      color: 'from-gray-400 to-gray-500',
      textColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    };

    if (now >= startDate && now <= endDate) return {
      label: 'Live Now',
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    };

    // Check if registration is currently open
    const isRegistrationCurrentlyOpen = now >= registrationStart &&
      now <= registrationEnd;

    if (isRegistrationCurrentlyOpen) return {
      label: 'Open',
      color: 'from-blue-400 to-indigo-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    };

    // If registration hasn't started yet but hackathon is published
    if (now < registrationStart) return {
      label: 'Upcoming',
      color: 'from-purple-400 to-indigo-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    };

    return {
      label: 'Closed',
      color: 'from-red-400 to-pink-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    };
  };

  const status = getStatus();
  const spotsLeft = hackathon.max_participants - hackathon.confirmed_participants;
  const fillPercentage = hackathon.max_participants > 0 ?
    (hackathon.confirmed_participants / hackathon.max_participants) * 100 : 0;

  // Check if registration is currently open
  const isRegistrationOpen = now >= registrationStart &&
    now <= registrationEnd;

  // Check if registration will open soon
  const isUpcoming = now < registrationStart;

  const isCompleted = now > endDate

  const getModeInfo = () => {
    switch (hackathon.mode) {
      case 'online': return { icon: Globe, label: 'Online', color: 'text-green-500' };
      case 'offline': return { icon: MapIcon, label: 'In-Person', color: 'text-blue-500' };
      case 'hybrid': return { icon: Monitor, label: 'Hybrid', color: 'text-purple-500' };
      default: return { icon: Globe, label: 'Online', color: 'text-green-500' };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  // Prize formatting
  const formatPrize = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || numAmount === 0) return 'No Prize';
    if (numAmount >= 100000) return `₹${(numAmount / 100000).toFixed(1)}L`;
    if (numAmount >= 1000) return `₹${(numAmount / 1000).toFixed(0)}K`;
    return `₹${numAmount}`;
  };

  // Calculate total prize
  const getTotalPrize = () => {
    const totalPool = parseFloat(hackathon.total_prize_pool) || 0;

    if (totalPool > 0) {
      return totalPool;
    }

    // If total pool is 0, try to calculate from individual prizes
    if (hackathon.prizes && typeof hackathon.prizes === 'object') {
      let total = 0;
      Object.values(hackathon.prizes).forEach(prize => {
        // Remove currency symbols and convert to number
        const cleanPrize = typeof prize === 'string' ?
          prize.replace(/[₹,]/g, '').trim() : prize;
        const numPrize = parseFloat(cleanPrize) || 0;
        total += numPrize;
      });
      return total;
    }

    return 0;
  };

  const handleApply = () => {
    if (!isOrganizer) {
      onApply && onApply(hackathon);
    }
  };

  const handleViewDetails = () => {
    onViewDetails && onViewDetails(hackathon.id);
  };

  // Get application status display
  const getApplicationStatusDisplay = () => {
    if (!applicationStatus) return null;

    switch (applicationStatus) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' };
      case 'payment_pending':
        return { label: 'Payment Pending', color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' };
      case 'applied':
        return { label: 'Applied', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      default:
        return { label: 'Applied', color: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800' };
    }
  };

  const applicationStatusDisplay = getApplicationStatusDisplay();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 flex flex-col"
    >
      {/* Enhanced header with gradient overlay */}
      <div className="relative overflow-hidden flex-shrink-0 h-48">
        <div className={`absolute inset-0`}></div>
        <img
          src={bannerImage}
          alt={hackathon.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            // Fallback image if the main image fails to load
            e.target.src = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/media/hackathons/banners/placeholder-image.jpg`;
          }}
        />

        {/* Status and Featured badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`px-4 py-2 rounded-full backdrop-blur-md border border-white/20 text-white font-bold text-sm bg-gradient-to-r ${status.color}`}>
            <div className="flex items-center gap-2">
              {status.label === 'Live Now' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              {status.label}
            </div>
          </div>
          {hackathon.is_featured && (
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              <Star className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        {/* Mode */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className={`px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/20 text-sm font-medium flex items-center gap-1.5 ${modeInfo.color}`}>
            <ModeIcon className="w-3.5 h-3.5" />
            {modeInfo.label}
          </div>
        </div>

        {/* Difficulty badge */}
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
            {hackathon.difficulty_level?.charAt(0).toUpperCase() + hackathon.difficulty_level?.slice(1)}
          </div>
        </div>

        {/* Registration fee */}
        {!hackathon.is_free && (
          <div className="absolute bottom-4 right-4">
            <div className="px-3 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-sm font-bold flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              ₹{hackathon.registration_fee}
            </div>
          </div>
        )}
      </div>

      {/* Content - Flexible area */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title and description */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight min-h-[3.5rem]">
            {hackathon.title}
          </h3>
        </div>

        {/* Categories */}
        {hackathon.categories && hackathon.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem]">
            {hackathon.categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full border border-indigo-200/50 dark:border-indigo-800/50 font-medium"
              >
                {category}
              </span>
            ))}
            {hackathon.categories.length > 3 && (
              <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full font-medium">
                +{hackathon.categories.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Key information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{format(startDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{formatDistance(endDate, startDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 text-purple-500" />
              <span>{hackathon.confirmed_participants}/{hackathon.max_participants}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="truncate">{hackathon.venue || 'Online'}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Participation</span>
            <span>{Math.round(fillPercentage)}% filled</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full bg-gradient-to-r ${fillPercentage > 80
                ? 'from-red-400 to-red-500'
                : fillPercentage > 60
                  ? 'from-yellow-400 to-orange-500'
                  : 'from-green-400 to-emerald-500'
                } rounded-full`}
            />
          </div>
        </div>

        {/* Info/warnings */}
        <div className="space-y-3 mb-4 flex-1">
          {isUpcoming && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                Registration opens {formatDistance(registrationStart, now, { addSuffix: true })}
              </span>
            </div>
          )}
          {isRegistrationOpen && spotsLeft <= 20 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                Only {spotsLeft} spots remaining!
              </span>
            </div>
          )}
          {isRegistrationOpen && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <Timer className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                Registration closes {formatDistance(registrationEnd, now, { addSuffix: true })}
              </span>
            </div>
          )}
          {!isRegistrationOpen && !isUpcoming && !isCompleted && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <ListEnd className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                Registration closed
              </span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
              <ListEnd className="w-4 h-4 dark:text-white flex-shrink-0" />
              <span className="text-black-700 dark:text-white text-sm font-medium">
                Registration closed
              </span>
            </div>
          )}
        </div>

        {/* Footer - buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="space-y-1">
            <div className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatPrize(getTotalPrize())}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Details */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              onClick={handleViewDetails}
            >
              <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </motion.button>
            {/* Apply button logic */}
            {/* {isOrganizer && (
              <span className="px-6 py-3 rounded-xl border font-semibold bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 flex items-center gap-2 select-none cursor-default">
                <Star className="w-5 h-5" />
                Organizer
              </span>
            )}
            {!isOrganizer && (
              userApplied ? (
                <div className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold ${applicationStatusDisplay?.color || 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'}`}>
                  <CheckCircle className="w-5 h-5" />
                  <span>{applicationStatusDisplay?.label || 'Applied'}</span>
                </div>
              ) : isRegistrationOpen && spotsLeft > 0 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isApplying ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              ) : isUpcoming ? (
                <button
                  disabled
                  className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-semibold cursor-not-allowed border border-purple-200 dark:border-purple-800"
                >
                  Registration Soon
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-semibold cursor-not-allowed"
                >
                  {spotsLeft === 0 ? 'Full' : 'Closed'}
                </button>
              )
            )} */}
          </div>
        </div>
      </div>
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
    </motion.div>
  );
};

export default HackathonCard;
