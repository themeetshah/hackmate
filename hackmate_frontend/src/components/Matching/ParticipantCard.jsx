import React from 'react';
import { motion } from 'framer-motion';
import {
  Star, Github, MapPin, MessageCircle, UserPlus, Target,
  AlertTriangle, ExternalLink, Linkedin, Globe, GitBranch,
  TrendingUp, Code, Heart, Users
} from 'lucide-react';

const ParticipantCard = ({ participant, onInvite, onMessage, onJoinTeam, showInviteLabel }) => {
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

  const GitHubInfo = ({ githubInfo, githubUrl }) => {
    if (!githubUrl) return null;

    if (!githubInfo || !githubInfo.is_valid) {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-xs">Invalid GitHub</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Github className="w-3 h-3" />
        <span className="text-xs">@{githubInfo.username}</span>
        {githubInfo.is_active && (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {participant.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {participant.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {participant.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {participant.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${experienceColors[participant.experience] || experienceColors.beginner}`}>
                  {participant.experience}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {participant.location}
              </div>
              {participant.github && (
                <div className="mt-1">
                  <GitHubInfo
                    githubInfo={participant.githubInfo}
                    githubUrl={participant.github}
                  />
                </div>
              )}
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
          {participant.sharedSkills && participant.sharedSkills.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Shared Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {participant.sharedSkills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {participant.complementarySkills && participant.complementarySkills.length > 0 && (
            <div>
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                <Code className="w-3 h-3" />
                Complementary Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {participant.complementarySkills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(!participant.sharedSkills || participant.sharedSkills.length === 0) &&
            (!participant.complementarySkills || participant.complementarySkills.length === 0) &&
            participant.skills && participant.skills.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</div>
                <div className="flex flex-wrap gap-1">
                  {participant.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
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
            )}
        </div>

        {/* <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {participant.github && participant.githubInfo?.is_valid && (
              <a
                href={participant.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
              >
                <Github className="w-4 h-4" />
                {participant.githubInfo?.is_active && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </a>
            )}
            {participant.github && !participant.githubInfo?.is_valid && (
              <div className="p-2 text-red-400 cursor-not-allowed" title="Invalid GitHub URL">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            {participant.linkedin && (
              <a
                href={participant.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {participant.portfolio && (
              <a
                href={participant.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onMessage?.(participant)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          {/* ✅ Updated button logic 
          {onJoinTeam ? (
            <button
              onClick={onJoinTeam}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Team
            </button>
          ) : onInvite ? (
            <button
              onClick={onInvite}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Unavailable
            </button>
          )}
        </div> */}
      </div>
    </motion.div>
  );
};

export default ParticipantCard;
