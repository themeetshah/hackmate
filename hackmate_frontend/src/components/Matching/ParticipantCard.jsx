import React from 'react';
import { motion } from 'framer-motion';
// highlight-next-line
import { Star, Github, MapPin, MessageCircle, UserPlus, Target } from 'lucide-react';

const ParticipantCard = ({ participant, onInvite, onMessage }) => {
  const experienceColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  };

  const getCompatibilityColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getCompatibilityBg = (score) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 80) return 'bg-blue-100 dark:bg-blue-900/20';
    if (score >= 70) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-sm"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {participant.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {participant.rating}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${experienceColors[participant.experience]}`}>
                  {participant.experience}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {participant.location}
              </div>
            </div>
          </div>

          <div className={`px-3 py-2 rounded-lg ${getCompatibilityBg(participant.compatibility)}`}>
            <div className="text-center">
              <div className={`text-lg font-bold ${getCompatibilityColor(participant.compatibility)}`}>
                {participant.compatibility}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Match
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {participant.bio}
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</div>
            <div className="flex flex-wrap gap-1">
              {participant.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className={`px-2 py-1 rounded text-xs font-medium ${participant.commonSkills.includes(skill)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {skill}
                </span>
              ))}
              {participant.skills.length > 4 && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  +{participant.skills.length - 4}
                </span>
              )}
            </div>
          </div>

          {participant.complementarySkills.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                Complementary Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {participant.complementarySkills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {participant.github && (
              <a
                href={`https://github.com/${participant.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onMessage?.(participant)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onInvite?.(participant)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantCard;