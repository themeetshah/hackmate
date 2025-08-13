import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Trophy, Clock, ExternalLink } from 'lucide-react';
import { format, formatDistance } from 'date-fns';

const HackathonCard = ({ hackathon, onApply }) => {
  // Defensive fallback for missing fields
  const now = new Date();
  const startDate = hackathon.startDate ? new Date(hackathon.startDate) : now;
  const endDate = hackathon.endDate ? new Date(hackathon.endDate) : now;
  const registrationDeadline = hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline) : startDate;
  const isRegistrationOpen = now < registrationDeadline;

  const getStatus = () => {
    if (now > endDate) return { label: 'Completed', color: 'gray' };
    if (now >= startDate && now <= endDate) return { label: 'Live', color: 'green' };
    if (isRegistrationOpen) return { label: 'Open', color: 'blue' };
    return { label: 'Closed', color: 'red' };
  };

  const status = getStatus();

  const typeColors = {
    online: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'in-person': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    hybrid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const statusColors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative">
        <img
          src={hackathon.image || 'https://mlh.io/assets/images/mlh-logo-color.png'}
          alt={hackathon.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[hackathon.type] || typeColors.other}`}>
            {hackathon.type ? hackathon.type.charAt(0).toUpperCase() + hackathon.type.slice(1) : 'Other'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status.color]}`}>
            {status.label}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {hackathon.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {hackathon.description}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{hackathon.location || 'Unknown'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{hackathon.participants || 0} participants • Max {hackathon.maxTeamSize || '-'} per team</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Registration closes {formatDistance(registrationDeadline, now, { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(hackathon.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {hackathon.tags && hackathon.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              +{hackathon.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {hackathon.prizePool || '-'}
            </div>
          </div>

          <div className="flex space-x-2">
            <a
              href={hackathon.url || hackathon.registrationUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>
            {isRegistrationOpen && status.label !== 'Completed' && (
              <button
                onClick={() => onApply?.(hackathon)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Apply Now
              </button>
            )}
            {!isRegistrationOpen && status.label !== 'Completed' && (
              <button
                disabled
                className="bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
              >
                Registration Closed
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HackathonCard;
