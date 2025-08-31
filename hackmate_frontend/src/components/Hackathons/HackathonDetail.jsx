import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Users, Trophy, Clock, ExternalLink,
    Star, Zap, ArrowRight, CheckCircle, CreditCard, Share2, Download,
    Globe, Monitor, MapIcon, DollarSign, Timer, Loader, Heart,
    IndianRupee, Eye, Award, Target, BookOpen, Code, Sparkles,
    AlertCircle, Info, Link as LinkIcon, Mail, Phone, Sun, Moon,
    TrendingUp, Activity, Wifi, WifiOff, Layers, Play, Volume2,
    ChevronUp, MessageCircle, Gift, Users2, Share, Coffee,
    Gamepad2, Cpu, Database, Palette, Shield, Briefcase,
    GraduationCap, Headphones, Camera, Film, Mic, Brain, Lightbulb,
    Rocket, ChevronDown, Menu, X, Copy, Twitter, Facebook
} from 'lucide-react';
import { format, formatDistance, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';

// ✨ ENHANCED: Animated Tech/Theme Icons Component
const AnimatedTechIcon = ({ tech }) => {
    const getIcon = () => {
        const techLower = tech.toLowerCase();
        if (techLower.includes('react')) return Code;
        if (techLower.includes('python')) return Cpu;
        if (techLower.includes('database') || techLower.includes('sql')) return Database;
        if (techLower.includes('ai') || techLower.includes('ml')) return Brain;
        if (techLower.includes('design') || techLower.includes('ui')) return Palette;
        if (techLower.includes('mobile') || techLower.includes('app')) return Phone;
        if (techLower.includes('web')) return Globe;
        if (techLower.includes('game')) return Gamepad2;
        if (techLower.includes('security')) return Shield;
        if (techLower.includes('blockchain')) return Layers;
        return Code;
    };

    const Icon = getIcon();

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{
                scale: 1.08,
                y: -3,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-300 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium border border-purple-200 dark:border-purple-800 cursor-default shadow-lg hover:shadow-xl transition-all duration-300 min-w-0"
        >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">{tech}</span>
        </motion.div>
    );
};

// ✨ ENHANCED: Floating Action Button
const FloatingButton = ({ onClick, icon: Icon, label, color, position }) => {
    return (
        <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{
                scale: 1.15,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                rotate: 360
            }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`fixed ${position} ${color} text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50 group`}
            title={label}
        >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
        </motion.button>
    );
};

// ✨ Scroll to Top Button
const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <FloatingButton
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    icon={ChevronUp}
                    label="Scroll to Top"
                    color="bg-gradient-to-r from-gray-800 to-gray-600"
                    position="bottom-20 sm:bottom-24 right-4 sm:right-6"
                />
            )}
        </AnimatePresence>
    );
};

// ✨ ENHANCED: Interactive Progress Ring
const ProgressRing = ({ percentage, size }) => {
    // Responsive size calculation
    const actualSize = size || (typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : window.innerWidth < 1024 ? 120 : 140);
    const strokeWidth = actualSize < 120 ? 8 : 10;
    const center = actualSize / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg width={actualSize} height={actualSize} className="transform -rotate-90">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: circumference,
                    }}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: "spring" }}
                    className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
                >
                    {Math.round(percentage)}%
                </motion.span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Full
                </span>
            </div>
        </div>
    );
};

// 🚀 ENHANCED: Glassmorphism Card Component
const GlassCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 ${className}`}
    >
        {children}
    </motion.div>
);

// ✨ Section Heading Component
const SectionHeading = ({ icon: Icon, text, iconColor = "text-indigo-600" }) => (
    <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8 flex items-center gap-3 sm:gap-4"
    >
        <motion.div
            whileHover={{ rotate: 360 }}
            className="p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl sm:rounded-2xl flex-shrink-0"
        >
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${iconColor}`} />
        </motion.div>
        <span className="truncate">{text}</span>
    </motion.h2>
);

// ✨ MAIN COMPONENT
const HackathonDetail = () => {
    const { id } = useParams();
    const { user, theme } = useAuth();
    const navigate = useNavigate();

    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [userApplication, setUserApplication] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // ✨ Parallax effect
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, -50]);
    const y2 = useTransform(scrollY, [0, 300], [0, -25]);

    const parseAsLocalTime = (dateString) => {
        if (!dateString) return null;
        const cleanDateString = dateString.replace('Z', '');
        return parseISO(cleanDateString);
    };

    // Enhanced data fetching
    useEffect(() => {
        const fetchHackathonDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await hackathonServices.getHackathonById(id);

                if (response.success) {
                    setHackathon(response.data.hackathon);

                    if (user) {
                        try {
                            const applicationResponse = await hackathonServices.getUserApplication(id);
                            if (applicationResponse.success) {
                                setUserApplication(applicationResponse.data);
                            }
                        } catch (appError) {
                            console.log('No existing application found');
                        }
                    }
                } else {
                    throw new Error(response.error || 'Failed to fetch hackathon details');
                }
            } catch (err) {
                console.error('Failed to fetch hackathon:', err);
                setError(err.message || 'Failed to load hackathon details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHackathonDetails();
        }
    }, [id, user]);

    // Apply to hackathon
    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isApplying) return;
        setIsApplying(true);
        navigate('register/')

        // try {
        //     const applicationData = {
        //         application_type: hackathon.registration_type === 'team' ? 'team' : 'individual',
        //         skills_bringing: user.skills || [],
        //         looking_for_team: hackathon.registration_type !== 'individual',
        //         preferred_team_size: hackathon.max_team_size,
        //         preferred_roles: ['developer', 'frontend'],
        //         open_to_remote_collaboration: hackathon.mode !== 'offline',
        //         project_ideas: `Excited to participate in ${hackathon.title} and build innovative solutions!`
        //     };

        //     const response = await hackathonServices.applyToHackathon(id, applicationData);

        //     if (response.success) {
        //         setUserApplication(response.data);

        //         if (response.data.status === 'confirmed') {
        //             alert(`🎉 Application confirmed! You're registered for "${hackathon.title}"`);
        //         } else if (response.data.status === 'payment_pending') {
        //             alert(`✅ Application submitted! Please complete payment to confirm your participation.`);
        //         } else {
        //             alert(`✅ Application submitted successfully!`);
        //         }
        //     } else {
        //         throw new Error(response.error || 'Application failed');
        //     }
        // } catch (error) {
        //     console.error('Application failed:', error);
        //     alert(`❌ Failed to apply: ${error.message}`);
        // } finally {
        //     setIsApplying(false);
        // }
    };

    // ✨ Enhanced share functionality
    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Check out this amazing hackathon: ${hackathon.title}`;

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                alert('Link copied to clipboard! 📋');
                break;
            default:
                if (navigator.share) {
                    navigator.share({ title: hackathon.title, text, url });
                } else {
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard! 📋');
                }
        }
    };

    // Download calendar event
    const downloadCalendarEvent = () => {
        const startDate = parseAsLocalTime(hackathon.start_date);
        const endDate = parseAsLocalTime(hackathon.end_date);

        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hackathon//Calendar//EN
BEGIN:VEVENT
UID:${hackathon.id}@hackathon.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${hackathon.title}
DESCRIPTION:${hackathon.short_description}
LOCATION:${hackathon.venue || 'Online'}
URL:${window.location.href}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${hackathon.title.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ✨ EPIC LOADING STATE
    // if (loading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 px-4">
    //             <motion.div
    //                 initial={{ opacity: 0, scale: 0.5 }}
    //                 animate={{ opacity: 1, scale: 1 }}
    //                 className="text-center space-y-6 sm:space-y-8 max-w-md mx-auto"
    //             >
    //                 <div className="relative">
    //                     <motion.div
    //                         animate={{ rotate: 360 }}
    //                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    //                         className="w-24 h-24 sm:w-32 sm:h-32 border-8 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"
    //                     />
    //                     <motion.div
    //                         animate={{ rotate: -360 }}
    //                         transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    //                         className="absolute inset-2 sm:inset-4 border-8 border-purple-200 border-t-purple-600 rounded-full"
    //                     />
    //                     <motion.div
    //                         animate={{ scale: [1, 1.2, 1] }}
    //                         transition={{ duration: 1, repeat: Infinity }}
    //                         className="absolute inset-6 sm:inset-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600"
    //                     />
    //                 </div>
    //                 <motion.div
    //                     initial={{ y: 20, opacity: 0 }}
    //                     animate={{ y: 0, opacity: 1 }}
    //                     transition={{ delay: 0.3 }}
    //                     className="space-y-2 sm:space-y-4"
    //                 >
    //                     <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    //                         Loading Epic Experience
    //                     </h3>
    //                     <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">
    //                         Preparing the most amazing hackathon page...
    //                     </p>
    //                 </motion.div>
    //             </motion.div>
    //         </div>
    //     );
    // }

    // Enhanced error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-900 to-purple-900 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 sm:space-y-6 max-w-md mx-auto p-6 sm:p-8"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 sm:w-32 sm:h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500"
                    >
                        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
                    </motion.div>
                    <div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400 mb-2 sm:mb-4">System Error</h3>
                        <p className="text-red-300 text-base sm:text-lg">{error}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/hackathons')}
                        className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg mx-auto"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        Return to Safety
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (!hackathon) return null;

    // Parse dates
    const now = new Date();
    const startDate = parseAsLocalTime(hackathon.start_date);
    const endDate = parseAsLocalTime(hackathon.end_date);
    const registrationStart = parseAsLocalTime(hackathon.registration_start);
    const registrationEnd = parseAsLocalTime(hackathon.registration_end);

    // Calculate status
    const getStatus = () => {
        console.log(now)
        console.log(startDate)
        console.log(endDate)
        console.log(registrationStart)
        console.log(registrationEnd)

        if (now > endDate) return {
            label: 'Completed',
            color: 'from-gray-400 to-gray-500',
            bgColor: 'bg-gray-100 dark:bg-gray-800'
        };

        if (now >= startDate && now <= endDate) return {
            label: 'Live Now',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        };

        const isRegistrationCurrentlyOpen = now >= registrationStart &&
            now <= registrationEnd;

        if (isRegistrationCurrentlyOpen) return {
            label: 'Registration Open',
            color: 'from-blue-400 to-indigo-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };

        if (now < registrationStart) return {
            label: 'Upcoming',
            color: 'from-purple-400 to-indigo-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        };

        return {
            label: 'Registration Closed',
            color: 'from-red-400 to-pink-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
    };

    const status = getStatus();
    const spotsLeft = hackathon.max_participants - hackathon.confirmed_participants;
    const fillPercentage = hackathon.max_participants > 0 ?
        (hackathon.confirmed_participants / hackathon.max_participants) * 100 : 0;

    const isRegistrationOpen = now >= registrationStart &&
        now <= registrationEnd &&
        spotsLeft > 0;

    const isUpcoming = now < registrationStart;

    // Prize formatting
    const formatPrize = (amount) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (!numAmount || numAmount === 0) return 'No Price';
        if (numAmount >= 100000) return `₹${(numAmount / 100000).toFixed(1)}L`;
        if (numAmount >= 1000) return `₹${(numAmount / 1000).toFixed(0)}K`;
        return `₹${numAmount}`;
    };

    // Get total prize
    const getTotalPrize = () => {
        const totalPool = parseFloat(hackathon.total_prize_pool) || 0;
        if (totalPool > 0) return totalPool;

        if (hackathon.prizes && typeof hackathon.prizes === 'object') {
            let total = 0;
            Object.values(hackathon.prizes).forEach(prize => {
                const cleanPrize = typeof prize === 'string' ?
                    prize.replace(/[₹,]/g, '').trim() : prize;
                const numPrize = parseFloat(cleanPrize) || 0;
                total += numPrize;
            });
            return total;
        }
        return 0;
    };

    const bannerImage = hackathon.banner_image ?
        (hackathon.banner_image.startsWith('http') ?
            hackathon.banner_image :
            `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${hackathon.banner_image}`) :
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/media/hackathons/banners/placeholder-image.jpg`;

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900`}>

            {/* ✨ ENHANCED NAVIGATION BAR */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl"
            >
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Back Button */}
                        <motion.button
                            whileHover={{ x: -5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/hackathons')}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg sm:rounded-xl bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </motion.button>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsBookmarked(!isBookmarked)}
                                className="p-2 rounded-lg sm:rounded-xl bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-all"
                            >
                                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleShare()}
                                className="p-2 rounded-lg sm:rounded-xl bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-all"
                            >
                                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={downloadCalendarEvent}
                                className="p-2 rounded-lg sm:rounded-xl bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-all"
                            >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                        </div>
                    </div>
                </nav>
            </motion.header>

            {/* 🌟 EPIC HERO SECTION */}
            <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
                <motion.div style={{ y: y1 }} className="absolute inset-0">
                    <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        src={bannerImage}
                        alt={hackathon.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/media/hackathons/banners/placeholder-image.jpg`;
                        }}
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-black/100 via-black/40 to-transparent"></div>

                {/* Hero Content */}
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8"
                >
                    <div className="mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full backdrop-blur-md border border-white/30 text-white font-bold text-sm sm:text-lg lg:text-xl bg-gradient-to-r ${status.color} shadow-2xl`}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {status.label === 'Live Now' && (
                                        <motion.div
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-white rounded-full"
                                        />
                                    )}
                                    {status.label}
                                </div>
                            </motion.div>

                            {hackathon.is_featured && (
                                <motion.div
                                    initial={{ rotate: -10, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold flex items-center gap-1 sm:gap-2 shadow-2xl text-sm sm:text-base"
                                >
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 fill-current" />
                                    Featured
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight"
                            style={{
                                fontSize: 'clamp(1.5rem, 5vw, 4rem)'
                            }}
                        >
                            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                                {hackathon.title}
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
                        >
                            {hackathon.short_description}
                        </motion.p>

                        {/* CTA Button */}
                        {/* <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {isRegistrationOpen ? (
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 50px rgba(0, 255, 255, 0.6)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="relative px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white font-bold text-lg sm:text-xl lg:text-2xl rounded-full shadow-2xl border-2 sm:border-4 border-white/20 overflow-hidden group disabled:opacity-50 w-full sm:w-auto"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                                        animate={{ x: [-100, 400] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    />
                                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-4">
                                        {isApplying ? (
                                            <>
                                                <Loader className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                                                REGISTER NOW
                                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            ) : (
                                <div className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 bg-gray-600/50 text-gray-300 font-bold text-lg sm:text-xl lg:text-2xl rounded-full border-2 sm:border-4 border-gray-400/20 w-full sm:w-auto">
                                    {isUpcoming ? 'Registration Opens Soon' : 'Registration Closed'}
                                </div>
                            )}
                        </motion.div> */}
                    </div>
                </motion.div>
            </div>

            {/* 🎯 KEY STATS SECTION */}
            <section className="relative mt-12 sm:mt-16 lg:mt-20 z-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {[
                            { icon: Calendar, label: 'Starts', value: format(startDate, 'MMM dd'), color: 'text-blue-500', bg: 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30' },
                            { icon: Clock, label: 'Duration', value: formatDistance(endDate, startDate), color: 'text-orange-500', bg: 'from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30' },
                            { icon: Users, label: 'Registered', value: `${hackathon.confirmed_participants}/${hackathon.max_participants}`, color: 'text-purple-500', bg: 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' },
                            { icon: Trophy, label: 'Prize Pool', value: formatPrize(getTotalPrize()), color: 'text-green-500', bg: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                                whileHover={{
                                    y: -10,
                                    rotateY: 15,
                                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
                                }}
                                className={`relative bg-gradient-to-br ${stat.bg} backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20`}
                            >
                                <div className="text-center">
                                    <div className={`p-2 sm:p-3 lg:p-4 ${stat.color} bg-white/20 rounded-xl sm:rounded-2xl mx-auto w-fit mb-2 sm:mb-4`}>
                                        <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2">{stat.label}</h3>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: index * 0.3 + 0.5, type: "spring" }}
                                        className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white"
                                    >
                                        {stat.value}
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 sm:gap-12 lg:gap-16">

                    {/* Left Column - Main Content */}
                    <div className="space-y-8 sm:space-y-12 lg:space-y-16 min-w-0">

                        {/* ✨ About Section */}
                        <GlassCard>
                            <SectionHeading icon={BookOpen} text="About This Hackathon" />
                            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg"
                                >
                                    {hackathon.short_description}
                                </motion.p>
                            </div>
                        </GlassCard>

                        {/* ✨ Categories & Tech Stack */}
                        <GlassCard>
                            <SectionHeading icon={Code} text="Categories & Tech Stack" iconColor="text-purple-600" />

                            <div className="space-y-6 sm:space-y-8">
                                {/* Categories */}
                                {hackathon.categories && hackathon.categories.length > 0 && (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Categories</h3>
                                        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                                            {hackathon.categories.map((category, index) => (
                                                <motion.span
                                                    key={index}
                                                    initial={{ scale: 0, rotate: -10 }}
                                                    whileInView={{ scale: 1, rotate: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.1 * index, type: "spring" }}
                                                    className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-800 dark:text-indigo-300 rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-medium border border-indigo-200 dark:border-indigo-800 cursor-default shadow-lg min-w-0"
                                                >
                                                    <span className="truncate">{category}</span>
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tech Stack */}
                                {hackathon.tech_stack && hackathon.tech_stack.length > 0 && (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Tech Stack</h3>
                                        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                                            {hackathon.tech_stack.map((tech, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ scale: 0, y: 20 }}
                                                    whileInView={{ scale: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.1 * index, type: "spring" }}
                                                >
                                                    <AnimatedTechIcon tech={tech} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Themes */}
                                {hackathon.themes && hackathon.themes.length > 0 && (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Themes</h3>
                                        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                                            {hackathon.themes.map((theme, index) => (
                                                <motion.span
                                                    key={index}
                                                    initial={{ scale: 0, rotate: 10 }}
                                                    whileInView={{ scale: 1, rotate: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.1 * index, type: "spring" }}
                                                    className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-medium border border-green-200 dark:border-green-800 cursor-default shadow-lg min-w-0"
                                                >
                                                    <span className="truncate">{theme}</span>
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* ✨ Prizes Section */}
                        {hackathon.prizes && Object.keys(hackathon.prizes).length > 0 && (
                            <GlassCard>
                                <SectionHeading icon={Trophy} text="Prizes & Rewards" iconColor="text-yellow-600" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                    {Object.entries(hackathon.prizes).map(([position, amount], index) => (
                                        <motion.div
                                            key={position}
                                            initial={{ scale: 0, rotate: -20 }}
                                            whileInView={{ scale: 1, rotate: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.2 * index, type: "spring", stiffness: 200 }}
                                            whileHover={{ scale: 1.05, y: -10 }}
                                            className="text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl sm:rounded-3xl border border-yellow-200 dark:border-yellow-800 shadow-xl"
                                        >
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                                className={`text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4 ${position === 'first' ? 'text-yellow-500' :
                                                    position === 'second' ? 'text-gray-400' :
                                                        'text-orange-600'
                                                    }`}
                                            >
                                                {position === 'first' ? '🥇' : position === 'second' ? '🥈' : '🥉'}
                                            </motion.div>
                                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white capitalize mb-2 sm:mb-3">
                                                {position} Prize
                                            </h3>
                                            <motion.p
                                                whileHover={{ scale: 1.1 }}
                                                className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400"
                                            >
                                                {formatPrize(amount)}
                                            </motion.p>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* ✨ Event Details */}
                        <GlassCard>
                            <SectionHeading icon={Info} text="Event Details" iconColor="text-blue-600" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                {[
                                    { icon: Calendar, label: 'Start Date', value: format(startDate, 'PPP p'), color: 'text-blue-500' },
                                    { icon: Calendar, label: 'End Date', value: format(endDate, 'PPP p'), color: 'text-red-500' },
                                    { icon: getModeIcon(hackathon.mode), label: 'Mode', value: hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1), color: 'text-green-500' },
                                    { icon: Target, label: 'Difficulty', value: hackathon.difficulty_level?.charAt(0).toUpperCase() + hackathon.difficulty_level?.slice(1), color: 'text-purple-500' },
                                    { icon: MapPin, label: 'Venue', value: hackathon.venue || 'Online', color: 'text-orange-500' },
                                    { icon: Users, label: 'Registration Type', value: hackathon.registration_type.replace('_', ' '), color: 'text-indigo-500' },
                                    { icon: CreditCard, label: 'Registration Fee', value: hackathon.is_free ? 'Free' : `₹${hackathon.registration_fee}`, color: 'text-green-500' },
                                    { icon: Mail, label: 'Organizer', value: hackathon.organizer_name || 'Event Organizer', color: 'text-pink-500' },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * index }}
                                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                                    >
                                        <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color} mt-1 flex-shrink-0`} />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{item.label}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-words">{item.value}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column - Enhanced Sidebar */}
                    <aside className="space-y-6 sm:space-y-8 lg:sticky lg:top-24 lg:self-start">

                        {/* ✨ Registration Card */}
                        <GlassCard>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                                Registration Status
                            </h3>

                            {/* Enhanced Progress Ring */}
                            <div className="flex items-center justify-center mb-6 sm:mb-8">
                                <ProgressRing percentage={fillPercentage} />
                            </div>

                            {/* Key Dates */}
                            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                {[
                                    { label: 'Registration Opens', date: registrationStart },
                                    { label: 'Registration Closes', date: registrationEnd },
                                    { label: 'Event Starts', date: startDate },
                                    { label: 'Event Ends', date: endDate },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="flex justify-between text-xs sm:text-sm p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                                    >
                                        <span className="text-gray-600 dark:text-gray-400 font-medium truncate pr-2">{item.label}:</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-right">
                                            {format(item.date, 'MMM dd, HH:mm')}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Status Messages */}
                            <AnimatePresence>
                                {isUpcoming && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl sm:rounded-2xl"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 text-purple-700 dark:text-purple-300">
                                            <Timer className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base">
                                                Registration opens {formatDistance(registrationStart, now, { addSuffix: true })}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {isRegistrationOpen && spotsLeft <= 20 && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl sm:rounded-2xl"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 text-red-700 dark:text-red-300">
                                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base">Only {spotsLeft} spots remaining!</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Application Status or Apply Button */}
                            {userApplication ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mb-4 sm:mb-6 p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl sm:rounded-2xl"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 text-green-700 dark:text-green-300">
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                                        <span className="font-bold text-base sm:text-lg">
                                            {userApplication.status === 'confirmed' ? 'Registered Successfully!' :
                                                userApplication.status === 'payment_pending' ? 'Payment Pending' :
                                                    'Application Submitted'}
                                        </span>
                                    </div>
                                    {userApplication.status === 'payment_pending' && (
                                        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2">
                                            Complete payment to confirm your participation.
                                        </p>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {console.log(isRegistrationOpen)}
                                    {console.log(isApplying)}
                                    {isRegistrationOpen && spotsLeft > 0 ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleApply}
                                            disabled={isApplying}
                                            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50"
                                        >
                                            {isApplying ? (
                                                <>
                                                    <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                                                    Applying...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    Register Now
                                                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </>
                                            )}
                                        </motion.button>
                                    ) : isUpcoming ? (
                                        <button
                                            disabled
                                            className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-not-allowed"
                                        >
                                            Registration Opens Soon
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-not-allowed"
                                        >
                                            {spotsLeft === 0 ? 'Event Full' : 'Registration Closed'}
                                        </button>
                                    )}

                                    {!user && (
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                            >
                                                Login
                                            </button> to register for this hackathon
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Prize Pool */}
                            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Total Prize Pool</p>
                                    <motion.p
                                        whileHover={{ scale: 1.1 }}
                                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400"
                                    >
                                        {formatPrize(getTotalPrize())}
                                    </motion.p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* ✨ Social Sharing Card */}
                        <GlassCard>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
                                Share This Event
                            </h3>

                            <div className="flex justify-center gap-3 sm:gap-4">
                                {[
                                    { platform: 'twitter', icon: Twitter, color: 'bg-blue-500', label: 'Twitter' },
                                    { platform: 'facebook', icon: Facebook, color: 'bg-blue-600', label: 'Facebook' },
                                    { platform: 'copy', icon: Copy, color: 'bg-gray-600', label: 'Copy Link' },
                                ].map((social) => (
                                    <motion.button
                                        key={social.platform}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleShare(social.platform)}
                                        className={`${social.color} p-3 sm:p-4 rounded-xl text-white font-bold flex flex-col items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[80px] shadow-xl`}
                                        title={social.label}
                                    >
                                        <social.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                        <span className="text-xs sm:text-xs lg:text-sm">{social.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </GlassCard>
                    </aside>
                </div>
            </main>

            {/* ✨ FLOATING ACTION BUTTONS */}
            <FloatingButton
                onClick={() => handleShare()}
                icon={Share2}
                label="Share Hackathon"
                color="bg-gradient-to-r from-purple-600 to-pink-600"
                position="bottom-4 sm:bottom-6 right-4 sm:right-6"
            />

            {/* ✨ Scroll to Top */}
            <ScrollToTop />

            {/* ✨ Chat Support */}
            <FloatingButton
                onClick={() => alert('Chat support coming soon! 💬')}
                icon={MessageCircle}
                label="Chat Support"
                color="bg-gradient-to-r from-green-600 to-emerald-600"
                position="bottom-4 sm:bottom-6 left-4 sm:left-6"
            />
        </div>
    );
};

// Helper function to get mode icon
const getModeIcon = (mode) => {
    switch (mode) {
        case 'online': return Globe;
        case 'offline': return MapPin;
        case 'hybrid': return Monitor;
        default: return Globe;
    }
};

export default HackathonDetail;
