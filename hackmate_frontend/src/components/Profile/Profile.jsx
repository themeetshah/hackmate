import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, UserCheck, Code, Mail, Share2, Edit3,
  Camera, Layers, Activity, ExternalLink, AlertCircle, Loader2,
  Github, Linkedin, Target, Award, Star, Trophy, Briefcase,
  Settings, Globe, MapPin, Calendar, Heart, Zap, Save,
  CheckCircle, XCircle, Plus, Minus, X, ArrowUpRight,
  Clock, TrendingUp, GitBranch, Flame, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../ui/Toast';
import userServices from '../../api/userServices';

/**
 * Enhanced visual tokens with better glass effects
 */
const cn = (...c) => c.filter(Boolean).join(" ");
const glass = "bg-white/70 dark:bg-neutral-800/50 backdrop-blur-md border border-white/20 dark:border-white/10";
const card = `rounded-2xl sm:rounded-3xl ${glass} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.3)] transition-shadow duration-300`;
const ringSoft = "ring-1 ring-black/5 dark:ring-white/5";
const tone = {
  blue: { bg: "bg-blue-50/80 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-blue-600" },
  green: { bg: "bg-green-50/80 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", gradient: "from-green-500 to-green-600" },
  purple: { bg: "bg-purple-50/80 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-purple-600" },
  orange: { bg: "bg-orange-50/80 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-orange-600" },
  yellow: { bg: "bg-yellow-50/80 dark:bg-yellow-900/20", text: "text-yellow-600 dark:text-yellow-400", gradient: "from-yellow-500 to-orange-500" },
  red: { bg: "bg-red-50/80 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", gradient: "from-red-500 to-red-600" }
};

/**
 * Enhanced motion variants
 */
const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
const item = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};
const presenceY = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};

/**
 * Enhanced UI primitives
 */
const Card = ({ className = "", children, hover = true }) => (
  <motion.div
    className={cn(card, ringSoft, hover && "hover:shadow-[0_16px_64px_-12px_rgba(0,0,0,0.2)]", className)}
    whileHover={hover ? { y: -2 } : undefined}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

const Empty = ({ icon: Icon = AlertCircle, title = "Nothing here yet", hint, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/40 dark:bg-neutral-800/30 border border-dashed border-white/40 dark:border-white/20"
  >
    <div className="p-3 sm:p-4 rounded-full bg-gray-100/60 dark:bg-gray-800/60">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500" />
    </div>
    <div className="text-center">
      <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</p>
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
    {action}
  </motion.div>
);

const StatTile = ({ label, value, Icon, color, loading = false }) => (
  <motion.div
    variants={item}
    className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 bg-white/60 dark:bg-neutral-800/40 backdrop-blur border border-white/30 dark:border-white/15 hover:bg-white/80 dark:hover:bg-neutral-800/60 hover:shadow-lg transition-all duration-300 group"
    whileHover={{ y: -3, scale: 1.02 }}
  >
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow", `bg-gradient-to-br ${tone[color]?.gradient} text-white`)}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </div>
      <div className={cn("text-lg sm:text-2xl md:text-3xl font-bold tabular-nums", tone[color]?.text)}>
        {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin" /> : (value ?? "—")}
      </div>
    </div>
    <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</div>
  </motion.div>
);

const SkillBadge = ({ skill, variant = 'default', onToggle, isSelected }) => {
  const variants = {
    default: 'bg-white/60 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300 border-white/30 dark:border-white/15',
    primary: 'bg-blue-50/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50',
    success: 'bg-green-50/80 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200/50 dark:border-green-800/50',
    selected: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500/50 shadow-lg shadow-blue-500/25'
  };

  const currentVariant = isSelected ? 'selected' : variant;

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border font-medium text-xs sm:text-sm transition-all duration-300 backdrop-blur",
        variants[currentVariant],
        onToggle ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      )}
    >
      <span className="truncate max-w-[120px] sm:max-w-none">{skill}</span>
      {onToggle && (
        <motion.span
          className="ml-1.5 sm:ml-2 flex-shrink-0"
          animate={{ rotate: isSelected ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isSelected ? <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
        </motion.span>
      )}
    </motion.button>
  );
};

// Screen size hook
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('lg');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else setScreenSize('lg');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Theme Detection Hook
const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};

// Utility functions
const extractUsername = (url, platform) => {
  if (!url) return '';
  if (!url.includes('http')) return url.trim();

  const patterns = {
    github: /github\.com\/([^/?#]+)/i,
    linkedin: /linkedin\.com\/in\/([^/?#]+)/i,
    leetcode: /leetcode\.com\/u?\/([^/?#]+)/i,
  };

  const regex = patterns[platform];
  const match = regex ? url.match(regex) : null;
  return match ? match[1] : '';
};

const formatProfileURL = (username, platform) => {
  if (!username) return '';
  const bases = {
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    leetcode: 'https://leetcode.com/u/',
  };
  return (bases[platform] || '') + username;
};

// Enhanced GitHub Stats Component
const GitHubStats = ({ githubUsername, theme }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const screenSize = useScreenSize();

  useEffect(() => {
    if (!githubUsername) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchGitHubStats = async () => {
      try {
        setLoading(true);
        setError(false);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`https://api.github.com/users/${githubUsername}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            setStats(data);
          }
        } else {
          console.error(`GitHub API Error: ${response.status} ${response.statusText}`);
          if (mounted) {
            setError(true);
          }
        }
      } catch (err) {
        console.error('GitHub API Error:', err);
        if (mounted && !err.name === 'AbortError') {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchGitHubStats();

    return () => {
      mounted = false;
    };
  }, [githubUsername]);

  const ghStatsUrl = useMemo(
    () => `https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&theme=${theme}&hide_border=true&bg_color=00000000&cache_seconds=86400`,
    [githubUsername, theme]
  );

  const ghLangsUrl = useMemo(
    () => `https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUsername}&layout=compact&theme=${theme}&hide_border=true&bg_color=00000000&cache_seconds=86400`,
    [githubUsername, theme]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 sm:p-6 animate-pulse" hover={false}>
            <div className="h-32 sm:h-40 md:h-48 bg-gray-200/60 dark:bg-gray-700/60 rounded-xl sm:rounded-2xl"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Empty
        title="GitHub stats unavailable"
        hint="Unable to load GitHub statistics. Please check the username or try again later."
        icon={Github}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
      {/* GitHub API Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatTile label="Repositories" value={stats.public_repos} Icon={BookOpen} color="blue" />
        <StatTile label="Followers" value={stats.followers} Icon={Users} color="green" />
        <StatTile label="Following" value={stats.following} Icon={UserCheck} color="purple" />
        <StatTile label="Gists" value={stats.public_gists} Icon={Code} color="orange" />
      </motion.div>

      {/* GitHub Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-3 sm:p-4 overflow-hidden">
          <img
            src={ghStatsUrl}
            alt="GitHub stats"
            className="w-full rounded-xl sm:rounded-2xl h-auto max-h-32 sm:max-h-40 md:max-h-48 object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              console.error('Failed to load GitHub stats image');
            }}
          />
        </Card>
        <Card className="p-3 sm:p-4 overflow-hidden">
          <img
            src={ghLangsUrl}
            alt="Top languages"
            className="w-full rounded-xl sm:rounded-2xl h-auto max-h-32 sm:max-h-40 md:max-h-48 object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              console.error('Failed to load GitHub languages image');
            }}
          />
        </Card>
      </div>

      {/* Contribution Chart */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">Contribution Activity</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Past 12 months</p>
            </div>
          </div>
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg sm:rounded-xl font-medium transition-colors shadow-lg flex-shrink-0 text-xs sm:text-sm"
          >
            <Github className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className={screenSize === 'xs' ? 'sr-only' : ''}>View Profile</span>
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </a>
        </div>

        <div className="overflow-x-auto rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-white/10">
          <img
            src={`https://ghchart.rshah.org/6366f1/${githubUsername}`}
            alt={`${githubUsername}'s contribution chart`}
            className="w-full h-auto max-h-24 sm:max-h-28 md:max-h-32 object-contain rounded-lg"
            style={{ minWidth: screenSize === 'xs' ? '300px' : '700px' }}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.alt = 'Contribution chart unavailable';
            }}
          />
        </div>
      </Card>
    </motion.div>
  );
};

// Enhanced LeetCode Stats Component
const LeetCodeStats = ({ leetcodeUsername, theme }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const screenSize = useScreenSize();

  useEffect(() => {
    if (!leetcodeUsername) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchLeetCodeStats = async () => {
      try {
        setLoading(true);
        setError(false);

        const apis = [
          `https://leetcode-api-faisalshohag.vercel.app/${leetcodeUsername}`,
          `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}`
        ];

        let data = null;
        for (const api of apis) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(api, {
              signal: controller.signal,
              headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              data = await response.json();
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (mounted) {
          if (data) {
            setStats(data);
          } else {
            setStats({ fallback: true });
          }
        }
      } catch (err) {
        console.error('LeetCode API Error:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchLeetCodeStats, 1000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [leetcodeUsername]);

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 animate-pulse" hover={false}>
        <div className="h-32 sm:h-40 md:h-48 bg-gray-200/60 dark:bg-gray-700/60 rounded-xl sm:rounded-2xl mb-4 sm:mb-6"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 sm:h-20 bg-gray-200/60 dark:bg-gray-700/60 rounded-xl"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">LeetCode Progress</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Problem solving journey</p>
          </div>
        </div>
        <a
          href={`https://leetcode.com/u/${leetcodeUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-medium transition-colors shadow-lg flex-shrink-0 text-xs sm:text-sm"
        >
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className={screenSize === 'xs' ? 'sr-only' : ''}>View Profile</span>
          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </a>
      </div>

      {/* LeetCode Card Image */}
      <div className="mb-4 sm:mb-6 bg-white/40 dark:bg-gray-900/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 dark:border-white/10 overflow-hidden">
        <img
          src={`https://leetcard.jacoblin.cool/${leetcodeUsername}?theme=${theme}&font=Karma&ext=contest`}
          alt={`${leetcodeUsername} LeetCode Stats`}
          className="w-full h-auto max-h-40 sm:max-h-48 md:max-h-56 object-contain rounded-lg sm:rounded-xl"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.alt = 'LeetCode card unavailable';
          }}
        />
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[
          {
            label: 'Total Solved',
            value: stats && !stats.fallback ? (stats.totalSolved || stats.solvedProblem || 0) : '?',
            icon: CheckCircle,
            color: 'green'
          },
          {
            label: 'Easy',
            value: stats && !stats.fallback ? (stats.easySolved || stats.easySolvedProblem || 0) : '?',
            icon: CheckCircle,
            color: 'green'
          },
          {
            label: 'Medium',
            value: stats && !stats.fallback ? (stats.mediumSolved || stats.mediumSolvedProblem || 0) : '?',
            icon: Target,
            color: 'yellow'
          },
          {
            label: 'Hard',
            value: stats && !stats.fallback ? (stats.hardSolved || stats.hardSolvedProblem || 0) : '?',
            icon: Award,
            color: 'red'
          }
        ].map((stat, index) => (
          <StatTile
            key={index}
            label={stat.label}
            value={stat.value}
            Icon={stat.icon}
            color={stat.color}
          />
        ))}
      </motion.div>

      {/* Rate limit notice */}
      {(error || (stats && stats.fallback)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 sm:mt-6 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
                Stats Temporarily Unavailable
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                LeetCode API is rate-limited. Visit the profile link above to see current statistics.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

// Enhanced Responsive Tab Navigation Component
const ResponsiveTabNavigation = ({ tabs, activeTab, setActiveTab }) => {
  const screenSize = useScreenSize();

  // Get tab icons
  const getTabIcon = (tabId) => {
    const icons = {
      overview: UserCheck,
      contributions: Activity,
      projects: Briefcase,
      hackathons: Trophy,
      settings: Settings
    };
    return icons[tabId] || UserCheck;
  };

  const TabButton = ({ tab, isActive, className = "" }) => {
    const TabIcon = getTabIcon(tab.id);

    return (
      <motion.button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-300 group rounded-xl sm:rounded-2xl",
          screenSize === 'xs'
            ? "px-2 py-2.5 sm:px-3 sm:py-3 min-w-0 flex-1"
            : screenSize === 'sm'
              ? "px-3 py-3 min-w-0 flex-1"
              : screenSize === 'md'
                ? "px-4 py-3"
                : "px-5 py-3 sm:px-6",
          className
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <TabIcon className={cn(
          "flex-shrink-0 transition-transform duration-200",
          screenSize === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5',
          isActive && "scale-110"
        )} />

        {screenSize !== 'xs' && screenSize !== 'sm' && (
          <span className="truncate">
            {tab.label}
          </span>
        )}

        {(screenSize === 'xs' || screenSize === 'sm') && (
          <div className="absolute -top-10 sm:-top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-lg">
            {tab.label}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        )}

        <div className={cn(
          "absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors duration-200 rounded-xl sm:rounded-2xl",
          isActive
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-300"
        )}>
          <TabIcon className={cn(
            "flex-shrink-0",
            screenSize === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5'
          )} />
          {screenSize !== 'xs' && screenSize !== 'sm' && (
            <span className="truncate">
              {tab.label}
            </span>
          )}
        </div>

        {isActive && (
          <motion.div
            layoutId="activeTabBackground"
            className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500/15 to-purple-500/15 dark:from-blue-400/15 dark:to-purple-400/15 border border-blue-500/30 shadow-lg"
            transition={{
              type: "spring",
              bounce: 0.25,
              duration: 0.6,
              layout: { duration: 0.3 }
            }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-6 sm:mt-8"
    >
      <div className={cn(
        "relative p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg",
        glass
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-900/5 dark:via-purple-900/5 dark:to-pink-900/5 opacity-60 rounded-xl sm:rounded-2xl"></div>

        <LayoutGroup id="profileTabs">
          <div className="relative z-10 flex items-center gap-1 sm:gap-2 w-full">
            <div className={cn(
              "flex gap-1 sm:gap-2 w-full",
              screenSize === 'xs' || screenSize === 'sm'
                ? "justify-center"
                : "flex-wrap justify-center"
            )}>
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                />
              ))}
            </div>
          </div>
        </LayoutGroup>
      </div>
    </motion.div>
  );
};

/**
 * Main Profile Page Component
 */
export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();
  const { toasts, hideToast, success, error } = useToast();
  const isDarkMode = useTheme();
  const screenSize = useScreenSize();

  // Theme for external widgets
  const theme = isDarkMode ? "tokyonight" : "default";

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  const [editForm, setEditForm] = useState(() => ({
    name: '',
    bio: '',
    location: '',
    github_username: '',
    linkedin_username: '',
    portfolio_url: '',
    leetcode_username: '',
    skills: [],
    interests: [],
    experience_level: 'beginner',
    availability_status: true,
  }));

  const isOwnProfile = useMemo(() =>
    !userId || (currentUser && currentUser.id === Number(userId)),
    [userId, currentUser?.id]
  );

  const skillOptions = useMemo(() => [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Vue.js', 'Angular',
    'Django', 'Flask', 'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Java', 'C++', 'Go', 'Rust', 'Swift',
    'Kotlin', 'Flutter', 'React Native', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'MongoDB', 'PostgreSQL', 'GraphQL', 'REST APIs'
  ], []);

  const interestOptions = useMemo(() => [
    'AI/ML', 'Web Development', 'Mobile Apps', 'Game Development', 'Blockchain',
    'IoT', 'Cybersecurity', 'Data Science', 'Cloud Computing', 'DevOps',
    'AR/VR', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Social Impact',
    'Sustainability', 'Hardware', 'Robotics', 'Computer Vision'
  ], []);

  // Load profile data
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        let userData;

        if (userId) {
          const res = await userServices.getUserById(userId);
          userData = res.user;
        } else {
          userData = currentUser;
        }

        if (mounted && userData) {
          setProfileUser(userData);

          setEditForm({
            name: userData.name || '',
            bio: userData.bio || '',
            location: userData.location || '',
            github_username: extractUsername(userData.github_url, 'github'),
            linkedin_username: extractUsername(userData.linkedin_url, 'linkedin'),
            leetcode_username: extractUsername(userData.leetcode_url, 'leetcode'),
            portfolio_url: userData.portfolio_url || '',
            skills: userData.skills || [],
            interests: userData.interests || [],
            experience_level: userData.experience_level || 'beginner',
            availability_status: userData.availability_status ?? true,
          });
        }
      } catch (e) {
        if (mounted) {
          error('Failed to load profile');
          navigate('/dashboard');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [userId, currentUser?.id]);

  // Handle form updates
  const updateField = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [formErrors]);

  // Toggle skills/interests
  const toggleSkillOrInterest = useCallback((item, type) => {
    setEditForm(prev => ({
      ...prev,
      [type]: prev[type].includes(item)
        ? prev[type].filter(i => i !== item)
        : [...prev[type], item]
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editForm.name]);

  // Save profile
  const saveProfile = useCallback(async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...editForm,
        github_url: formatProfileURL(editForm.github_username, 'github'),
        linkedin_url: formatProfileURL(editForm.linkedin_username, 'linkedin'),
        leetcode_url: formatProfileURL(editForm.leetcode_username, 'leetcode'),
      };

      const updatedUser = await updateProfile(payload, true);
      setProfileUser(updatedUser);
      setEditing(false);
      success('Profile updated successfully! 🎉');
    } catch (e) {
      error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [editForm, validateForm, updateProfile, success, error]);

  const tabs = useMemo(() => [
    { id: "overview", label: "Overview" },
    { id: "contributions", label: "Code Stats" },
    { id: "projects", label: "Projects" },
    { id: "hackathons", label: "Hackathons" },
    ...(isOwnProfile ? [{ id: "settings", label: "Settings" }] : [])
  ], [isOwnProfile]);

  const socialLinks = useMemo(() => [
    {
      platform: 'GitHub',
      url: profileUser?.github_url,
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white'
    },
    {
      platform: 'LinkedIn',
      url: profileUser?.linkedin_url,
      icon: Linkedin,
      color: 'hover:text-blue-600'
    },
    {
      platform: 'Portfolio',
      url: profileUser?.portfolio_url,
      icon: Globe,
      color: 'hover:text-purple-600'
    },
    {
      platform: 'LeetCode',
      url: profileUser?.leetcode_url,
      icon: Target,
      color: 'hover:text-orange-600'
    }
  ], [profileUser?.github_url, profileUser?.linkedin_url, profileUser?.portfolio_url, profileUser?.leetcode_url]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative text-gray-900 dark:text-white">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto backdrop-blur"></div>
              <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-200/20 dark:border-blue-800/20 rounded-full animate-pulse mx-auto"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Loading Profile</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Please wait while we fetch the data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Profile not found
  if (!profileUser) {
    return (
      <div className="min-h-screen relative text-gray-900 dark:text-white">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-red-50 via-white to-pink-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900" />
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100/60 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 backdrop-blur">
              <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Profile Not Found</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">The profile you're looking for doesn't exist or has been removed.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => hideToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </AnimatePresence>

      <div className="min-h-screen relative text-gray-900 dark:text-white">
        {/* Enhanced gradient background with noise texture */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-950 dark:to-blue-950/10" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] mix-blend-multiply dark:mix-blend-screen" style={{
          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%2260%22 height=%2260%22 filter=%22url(%23n)%22 opacity=%220.6%22/></svg>')"
        }} />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          {/* Enhanced Header - Mobile-first approach */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden p-4 sm:p-6 md:p-8">
              {/* Decorative corner glows */}
              <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/8 blur-3xl" />

              <div className="flex flex-col items-center text-center space-y-6 lg:flex-row lg:items-start lg:text-left lg:space-y-0 lg:space-x-8 relative z-10">
                {/* Enhanced Avatar - Better mobile sizing */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
                  <img
                    src={profileUser?.github_url ?
                      `https://github.com/${extractUsername(profileUser.github_url, 'github')}.png` :
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.name || 'User')}&background=6366f1&color=fff&size=128`
                    }
                    alt={`${profileUser?.name} avatar`}
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full ring-4 ring-white/60 dark:ring-white/10 shadow-2xl object-cover"
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.name || 'User')}&background=6366f1&color=fff&size=128`}
                    decoding="async"
                    loading="lazy"
                  />
                  <motion.div
                    className={cn(
                      "absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-3 sm:border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center",
                      profileUser?.availability_status ? 'bg-green-500' : 'bg-gray-400'
                    )}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {profileUser?.availability_status ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </motion.div>
                </div>

                {/* Header text and actions - Mobile optimized */}
                <div className="flex-1 w-full max-w-none">
                  <div className="flex flex-col space-y-6 lg:flex-row lg:items-start lg:justify-between lg:space-y-0 lg:space-x-4">
                    <div className="flex-1 min-w-0">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent break-words"
                      >
                        {profileUser?.name}
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 mt-2"
                      >
                        {profileUser?.experience_level?.charAt(0).toUpperCase() + profileUser?.experience_level?.slice(1)} Developer
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4"
                      >
                        {profileUser?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{profileUser.location}</span>
                          </span>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          Joined {profileUser?.date_joined ? new Date(profileUser.date_joined).getFullYear() : 'Recently'}
                        </span>

                        {/* Social links - Mobile responsive */}
                        {socialLinks.filter(link => link.url).length > 0 && (
                          <>
                            <span className="hidden lg:inline">•</span>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start">
                              {socialLinks.filter(link => link.url).slice(0, screenSize === 'xs' ? 1 : 2).map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn("inline-flex items-center gap-1 text-xs sm:text-sm underline decoration-dotted underline-offset-2 transition-colors hover:scale-105", link.color)}
                                >
                                  <link.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className={screenSize === 'xs' ? 'sr-only' : ''}>{link.platform}</span>
                                </a>
                              ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    </div>

                    {/* Action Buttons - Mobile stack, desktop row */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto"
                    >
                      {isOwnProfile ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setEditing(v => !v)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur"
                          >
                            <Edit3 className="w-4 h-4 inline -mt-0.5 mr-2" />
                            {editing ? "Cancel" : (screenSize === 'xs' ? 'Edit' : 'Edit Profile')}
                          </motion.button>
                          {editing && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={saveProfile}
                              disabled={saving}
                              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base bg-green-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save
                            </motion.button>
                          )}
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                          >
                            <Mail className="w-4 h-4 inline -mt-0.5 mr-2" />
                            Connect
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base bg-white/70 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 hover:shadow-lg transition-all"
                          >
                            <Share2 className="w-4 h-4 inline -mt-0.5 mr-2" />
                            Share
                          </motion.button>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Bio - Better mobile spacing */}
                  {profileUser?.bio && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-4 sm:mt-6 max-w-2xl leading-relaxed text-center lg:text-left"
                    >
                      {profileUser.bio}
                    </motion.p>
                  )}

                  {/* Quick Stats - Better mobile layout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8"
                  >
                    {[
                      { label: 'Projects', value: profileUser?.total_projects || 0, icon: Briefcase, color: 'blue' },
                      { label: 'Hackathons', value: profileUser?.total_hackathons || 0, icon: Trophy, color: 'purple' },
                      { label: 'Rating', value: profileUser?.average_rating || '4.5', icon: Star, color: 'yellow' }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl border border-white/20 dark:border-white/10 backdrop-blur hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-center mb-1 sm:mb-2">
                          <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl", `bg-gradient-to-br ${tone[stat.color]?.gradient} text-white shadow-lg`)}>
                            <stat.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                        <div className={cn("text-lg sm:text-2xl font-bold", tone[stat.color]?.text)}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Enhanced Tabs */}
          <ResponsiveTabNavigation
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Enhanced Content */}
          <div className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div key="overview" {...presenceY}>
                  {/* GitHub Stats Section */}
                  {profileUser?.github_url && (
                    <Card className="p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-xl flex-shrink-0">
                            <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">GitHub Activity</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Code contributions and statistics</p>
                          </div>
                        </div>
                      </div>

                      <GitHubStats
                        githubUsername={extractUsername(profileUser.github_url, 'github')}
                        theme={theme}
                      />
                    </Card>
                  )}

                  {/* LeetCode Section */}
                  {profileUser?.leetcode_url && (
                    <div className="mb-6 sm:mb-8">
                      <LeetCodeStats
                        leetcodeUsername={extractUsername(profileUser.leetcode_url, 'leetcode')}
                        theme={theme}
                      />
                    </div>
                  )}

                  {/* Skills & Interests */}
                  <Card className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl flex-shrink-0">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Skills & Interests</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Technologies and areas of interest</p>
                      </div>
                    </div>

                    <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                          <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 flex-shrink-0" />
                          Technical Skills
                        </h4>
                        <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-white/10 backdrop-blur min-h-[120px] sm:min-h-[150px] flex items-center">
                          {profileUser?.skills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
                              {profileUser.skills.map((skill, index) => (
                                <SkillBadge key={index} skill={skill} variant="primary" />
                              ))}
                            </div>
                          ) : (
                            <Empty
                              title="No skills added yet"
                              hint="Skills will be displayed here"
                              icon={Code}
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500 flex-shrink-0" />
                          Interests
                        </h4>
                        <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-white/10 backdrop-blur min-h-[120px] sm:min-h-[150px] flex items-center">
                          {profileUser?.interests?.length > 0 ? (
                            <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
                              {profileUser.interests.map((interest, index) => (
                                <SkillBadge key={index} skill={interest} variant="success" />
                              ))}
                            </div>
                          ) : (
                            <Empty
                              title="No interests added yet"
                              hint="Interests will be displayed here"
                              icon={Heart}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {!profileUser?.github_url && !profileUser?.leetcode_url && (
                    <Empty
                      title="No coding profiles connected"
                      hint={isOwnProfile ? "Connect your GitHub or LeetCode profiles to showcase your coding journey!" : "This user hasn't connected any coding platforms yet."}
                      icon={Activity}
                    />
                  )}
                </motion.div>
              )}

              {/* Code Stats Tab */}
              {activeTab === "contributions" && (
                <motion.div key="contributions" {...presenceY}>
                  <Card className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl flex-shrink-0">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Coding Activity</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Detailed programming statistics</p>
                      </div>
                    </div>

                    {profileUser?.github_url && (
                      <div className="mb-6 sm:mb-8">
                        <GitHubStats
                          githubUsername={extractUsername(profileUser.github_url, 'github')}
                          theme={theme}
                        />
                      </div>
                    )}

                    {profileUser?.leetcode_url && (
                      <div className="mt-6 sm:mt-8">
                        <LeetCodeStats
                          leetcodeUsername={extractUsername(profileUser.leetcode_url, 'leetcode')}
                          theme={theme}
                        />
                      </div>
                    )}

                    {!profileUser?.github_url && !profileUser?.leetcode_url && (
                      <Empty
                        title="No coding profiles connected"
                        hint={isOwnProfile ? "Connect your coding profiles to see detailed statistics" : "This user hasn't connected any coding platforms yet."}
                        icon={Activity}
                      />
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <motion.div key="projects" {...presenceY}>
                  <Card className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 text-white shadow-xl flex-shrink-0">
                          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Projects</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Featured work and contributions</p>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 text-xs sm:text-sm font-medium hover:shadow-lg transition-all backdrop-blur flex-shrink-0"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                          Add Project
                        </motion.button>
                      )}
                    </div>

                    <Empty
                      title="Projects coming soon"
                      hint="Project showcase will be available in the next update"
                      icon={Briefcase}
                    />
                  </Card>
                </motion.div>
              )}

              {/* Hackathons Tab */}
              {activeTab === "hackathons" && (
                <motion.div key="hackathons" {...presenceY}>
                  <Card className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-red-500 text-white shadow-xl flex-shrink-0">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Hackathons</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Competition history and achievements</p>
                      </div>
                    </div>

                    <Empty
                      title="Hackathons coming soon"
                      hint="Hackathon history and achievements will be displayed here"
                      icon={Trophy}
                    />
                  </Card>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && isOwnProfile && (
                <motion.div key="settings" {...presenceY}>
                  <Card className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-xl flex-shrink-0">
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Settings</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage your account preferences</p>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-blue-50/80 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                        <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 flex-shrink-0" />
                        Account Information
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur">
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email Address</div>
                          <div className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{profileUser?.email}</div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur">
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Username</div>
                          <div className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{profileUser?.username}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Edit Form */}
          <AnimatePresence>
            {editing && (
              <motion.div {...presenceY} className="mt-6 sm:mt-8">
                <Card className="p-4 sm:p-6 md:p-8 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                    {saving && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        Saving changes...
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Full name *
                        </label>
                        <input
                          className={cn(
                            "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur transition-all text-sm sm:text-base",
                            formErrors.name && "ring-2 ring-red-500 border-red-300"
                          )}
                          value={editForm.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                        {formErrors.name && (
                          <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Location
                        </label>
                        <input
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur text-sm sm:text-base"
                          value={editForm.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Bio <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur resize-none text-sm sm:text-base"
                        value={editForm.bio}
                        onChange={(e) => updateField('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Social Profiles */}
                    <div className="border-t border-white/20 dark:border-white/10 pt-4 sm:pt-6">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Social Profiles</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                            GitHub Username
                          </label>
                          <input
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur text-sm sm:text-base"
                            value={editForm.github_username}
                            onChange={(e) => updateField('github_username', e.target.value)}
                            placeholder="Enter your GitHub username"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />
                            LinkedIn Username
                          </label>
                          <input
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur text-sm sm:text-base"
                            value={editForm.linkedin_username}
                            onChange={(e) => updateField('linkedin_username', e.target.value)}
                            placeholder="Enter your LinkedIn username"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                            LeetCode Username
                          </label>
                          <input
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur text-sm sm:text-base"
                            value={editForm.leetcode_username}
                            onChange={(e) => updateField('leetcode_username', e.target.value)}
                            placeholder="Enter your LeetCode username"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                            Portfolio URL
                          </label>
                          <input
                            type="url"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur text-sm sm:text-base"
                            value={editForm.portfolio_url}
                            onChange={(e) => updateField('portfolio_url', e.target.value)}
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills & Interests */}
                    <div className="border-t border-white/20 dark:border-white/10 pt-4 sm:pt-6">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Skills & Interests</h4>

                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <h5 className="text-sm sm:text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 flex items-center">
                            <Code className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-500" />
                            Technical Skills ({editForm.skills.length})
                          </h5>
                          <div className="flex flex-wrap gap-2 sm:gap-3 max-h-32 sm:max-h-48 overflow-y-auto p-3 sm:p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl sm:rounded-2xl border border-white/20 dark:border-white/10 backdrop-blur">
                            {skillOptions.map((skill) => (
                              <SkillBadge
                                key={skill}
                                skill={skill}
                                isSelected={editForm.skills.includes(skill)}
                                onToggle={() => toggleSkillOrInterest(skill, 'skills')}
                                variant="primary"
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm sm:text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 flex items-center">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-red-500" />
                            Interests ({editForm.interests.length})
                          </h5>
                          <div className="flex flex-wrap gap-2 sm:gap-3 max-h-32 sm:max-h-48 overflow-y-auto p-3 sm:p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl sm:rounded-2xl border border-white/20 dark:border-white/10 backdrop-blur">
                            {interestOptions.map((interest) => (
                              <SkillBadge
                                key={interest}
                                skill={interest}
                                isSelected={editForm.interests.includes(interest)}
                                onToggle={() => toggleSkillOrInterest(interest, 'interests')}
                                variant="success"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
