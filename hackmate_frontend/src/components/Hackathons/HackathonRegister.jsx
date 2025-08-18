/* --------------------------------------------------------------------------
   HackathonRegister.jsx · REDESIGNED PREMIUM EDITION - SIMPLIFIED INDIVIDUAL REGISTRATION
   Professional registration with individual-only flow and confirmation-based limits
   -------------------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Loader, Users, User, CheckCircle, Plus, X, Globe,
    Code2, Trophy, Palette, Shield, Cpu, Database, Brain, Gamepad2,
    CreditCard, Calendar, Clock, AlertTriangle, Info, Star,
    ChevronRight, ChevronLeft, Briefcase, Send, Lightbulb
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';
import { useToast } from '../../hooks/useToast';
import Toast from '../ui/Toast';

/* ────────────────────────── Premium UI Components ─────────────────────── */
const HeroCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative bg-gradient-to-br from-white via-white/95 to-gray-50/80 
                dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-900/80 
                backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 
                dark:border-gray-700/30 overflow-hidden ${className}`}
    >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const PremiumButton = ({ children, variant = "primary", loading = false, ...props }) => {
    const variants = {
        primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
        secondary: "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40",
        outline: "border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500",
        premium: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40",
        warning: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || props.disabled}
            className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 
                  overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed
                  backdrop-blur-sm ${variants[variant]}`}
            {...props}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                {children}
            </span>
        </motion.button>
    );
};

const ModernTextArea = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
            {label}
        </label>
        <motion.div
            whileFocus={{ scale: 1.01 }}
            className="relative group"
        >
            <textarea
                {...props}
                className={`w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 
                   ${error ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} 
                   rounded-xl text-gray-900 dark:text-white placeholder-gray-400 
                   focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 
                   focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300
                   backdrop-blur-sm resize-none min-h-[120px]`}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
);

const PremiumChip = ({ children, active, onClick, deletable, icon: Icon, color = "indigo" }) => {
    const colorVariants = {
        indigo: active ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
        emerald: active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
    };

    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm 
                  transition-all duration-300 backdrop-blur-sm
                  ${colorVariants[color]}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="truncate max-w-[120px]">{children}</span>
            {deletable && <X className="w-3 h-3 ml-1 opacity-70 hover:opacity-100" />}
        </motion.button>
    );
};

/* ──────────────────────────── Smart Tag System ────────────────────────────── */
const SmartTagSystem = ({ label, tags, setTags, placeholder, icon: Icon, color = "indigo" }) => {
    const [value, setValue] = useState('');

    const addTag = (tag) => {
        if (!tag.trim() || tags.includes(tag.trim())) return;
        setTags([...tags, tag.trim()]);
    };

    const removeTag = (t) => setTags(tags.filter((x) => x !== t));

    const getSkillIcon = (skill) => {
        const skillLower = skill.toLowerCase();
        if (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular')) return Code2;
        if (skillLower.includes('python') || skillLower.includes('java') || skillLower.includes('c++')) return Cpu;
        if (skillLower.includes('design') || skillLower.includes('figma') || skillLower.includes('ui')) return Palette;
        if (skillLower.includes('database') || skillLower.includes('sql') || skillLower.includes('mongo')) return Database;
        if (skillLower.includes('ai') || skillLower.includes('ml') || skillLower.includes('data')) return Brain;
        if (skillLower.includes('game') || skillLower.includes('unity')) return Gamepad2;
        if (skillLower.includes('security') || skillLower.includes('blockchain')) return Shield;
        if (skillLower.includes('manager') || skillLower.includes('lead')) return Briefcase;
        return Code2;
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
                {label}
            </label>
            <div className="relative group">
                <div className="flex flex-wrap items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 
                        border-2 border-gray-200 dark:border-gray-600 rounded-xl min-h-[60px] 
                        backdrop-blur-sm focus-within:border-indigo-500 dark:focus-within:border-indigo-400 
                        focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300">
                    <AnimatePresence>
                        {tags.map((tag) => {
                            const TagIcon = getSkillIcon(tag);
                            return (
                                <PremiumChip
                                    key={tag}
                                    active
                                    deletable
                                    onClick={() => removeTag(tag)}
                                    icon={TagIcon}
                                    color={color}
                                >
                                    {tag}
                                </PremiumChip>
                            );
                        })}
                    </AnimatePresence>
                    <div className="flex items-center flex-1 min-w-[200px]">
                        <input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    addTag(value);
                                    setValue('');
                                }
                                if (e.key === 'Backspace' && !value) removeTag(tags[tags.length - 1]);
                            }}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white 
                         placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <motion.button
                            type="button"
                            onClick={() => { addTag(value); setValue(''); }}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-indigo-500 hover:text-indigo-600 p-1 rounded-lg 
                         hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </div>
    );
};

/* ──────────────────────── Progress Indicator ────────────────────────────── */
const ProgressIndicator = ({ currentStep, totalSteps, stepLabels }) => (
    <div className="relative">
        <div className="flex items-center justify-between mb-12">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex flex-col items-center relative">
                    <motion.div
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                        transition-all duration-500 z-10
                        ${i <= currentStep
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40'
                                : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-600'}`}
                        animate={i === currentStep ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {i < currentStep ? <CheckCircle className="w-6 h-6" /> : i + 1}
                        {i <= currentStep && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-400/20"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </motion.div>
                    <p className={`mt-3 text-sm font-medium transition-colors
                         ${i <= currentStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                        {stepLabels[i]}
                    </p>
                    {i < totalSteps - 1 && (
                        <div className={`absolute top-6 left-12 w-24 h-0.5 transition-all duration-500
                            ${i < currentStep
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                : 'bg-gray-200 dark:bg-gray-600'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    </div>
);

/* ──────────────────────── Application Status Card ────────────────────────── */
const ApplicationStatusCard = ({ application, hackathon, onMakePayment, makingPayment = false }) => {
    const navigate = useNavigate();

    const getStatusConfig = (status) => {
        const configs = {
            confirmed: { color: 'green', icon: CheckCircle, label: 'Confirmed', bg: 'bg-green-50 dark:bg-green-900/20' },
            team_pending: { color: 'purple', icon: Users, label: 'Team Formation Pending', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            payment_pending: { color: 'orange', icon: CreditCard, label: 'Payment Pending', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            applied: { color: 'blue', icon: Clock, label: 'Under Review', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            rejected: { color: 'red', icon: X, label: 'Rejected', bg: 'bg-red-50 dark:bg-red-900/20' }
        };
        return configs[status] || configs.applied;
    };

    const statusConfig = getStatusConfig(application.status);
    const StatusIcon = statusConfig.icon;

    return (
        <HeroCard className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Application</h2>
                        <p className="text-gray-600 dark:text-gray-400">Application submitted successfully</p>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${statusConfig.bg} border-2 mb-8`}
                style={{
                    borderColor: statusConfig.color === 'green' ? '#10b981' :
                        statusConfig.color === 'purple' ? '#8b5cf6' :
                            statusConfig.color === 'orange' ? '#f59e0b' :
                                statusConfig.color === 'blue' ? '#3b82f6' :
                                    statusConfig.color === 'red' ? '#ef4444' : '#6b7280'
                }}>
                <StatusIcon className="w-5 h-5" style={{
                    color: statusConfig.color === 'green' ? '#059669' :
                        statusConfig.color === 'purple' ? '#7c3aed' :
                            statusConfig.color === 'orange' ? '#d97706' :
                                statusConfig.color === 'blue' ? '#2563eb' :
                                    statusConfig.color === 'red' ? '#dc2626' : '#4b5563'
                }} />
                <span className="font-bold" style={{
                    color: statusConfig.color === 'green' ? '#065f46' :
                        statusConfig.color === 'purple' ? '#581c87' :
                            statusConfig.color === 'orange' ? '#92400e' :
                                statusConfig.color === 'blue' ? '#1e40af' :
                                    statusConfig.color === 'red' ? '#991b1b' : '#374151'
                }}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Application Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Registration Type</h3>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-indigo-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">Individual</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Applied On</h3>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(application.applied_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                        {application.looking_for_team && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">Looking for team</span>
                            </div>
                        )}
                        {application.open_to_remote_collaboration && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Globe className="w-4 h-4 text-green-600" />
                                <span className="text-green-800 dark:text-green-200 text-sm font-medium">Remote friendly</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Skills and Roles */}
            {(application.skills_bringing?.length > 0 || application.preferred_roles?.length > 0) && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {application.skills_bringing?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {application.skills_bringing.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 
                                 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {application.preferred_roles?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Preferred Roles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {application.preferred_roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 
                                 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Project Ideas */}
            {application.project_ideas && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Project Ideas</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        {application.project_ideas}
                    </p>
                </div>
            )}

            {/* Team Formation Pending Status */}
            {application.status === 'team_pending' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="w-6 h-6 text-purple-600" />
                        <h4 className="font-bold text-purple-800 dark:text-purple-200">Team Formation Required</h4>
                    </div>
                    <p className="text-purple-700 dark:text-purple-300">
                        Your registration is confirmed! You now need to form or join a team before the hackathon starts.
                        {application.payment_status === 'completed' && application.amount_paid > 0 && (
                            <><br /><span className="text-sm">Payment of ₹{application.amount_paid} completed successfully.</span></>
                        )}
                    </p>
                    <div className="mt-4">
                        <PremiumButton
                            onClick={() => navigate('/teams')}
                            variant="secondary"
                        >
                            <Users className="w-4 h-4" />
                            Go to Team Formation
                        </PremiumButton>
                    </div>
                </div>
            )}

            {/* Payment pending section - only if max capacity not reached */}
            {application.status === 'payment_pending' && application.payment_status === 'pending' && hackathon.confirmed_participants < hackathon.max_participants && (
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                        <h4 className="font-bold text-orange-800 dark:text-orange-200">Payment Required</h4>
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 mb-4">
                        Complete your payment of <span className="font-bold">₹{hackathon.registration_fee}</span> to confirm your participation.
                        {hackathon.registration_type === 'team' && (
                            <><br /><span className="text-sm">After payment, you'll need to form or join a team.</span></>
                        )}
                        <br />
                        <span className="text-sm">Payment deadline: {new Date(application.payment_deadline || hackathon.registration_end).toLocaleDateString()}</span>
                    </p>
                    <PremiumButton
                        variant="premium"
                        onClick={onMakePayment}
                        loading={makingPayment}
                        disabled={makingPayment}
                    >
                        <CreditCard className="w-4 h-4" />
                        {makingPayment ? 'Processing Payment...' : 'Complete Payment'}
                    </PremiumButton>
                </div>
            )}

            {/* Max capacity reached - no more payments */}
            {application.status === 'payment_pending' && hackathon.confirmed_participants >= hackathon.max_participants && (
                <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <X className="w-6 h-6 text-red-600" />
                        <h4 className="font-bold text-red-800 dark:text-red-200">Registration Closed</h4>
                    </div>
                    <p className="text-red-700 dark:text-red-300">
                        Unfortunately, the hackathon has reached its maximum capacity of {hackathon.max_participants} confirmed participants.
                        Your application will be moved to rejected status.
                    </p>
                </div>
            )}

            {/* Confirmed status */}
            {application.status === 'confirmed' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-green-800 dark:text-green-200">Registration Confirmed!</h4>
                    </div>
                    <p className="text-green-700 dark:text-green-300">
                        {hackathon.registration_type === 'individual'
                            ? "You're all set for the individual hackathon. Check your email for further updates and event details."
                            : "You're confirmed for the hackathon! You can now participate individually or form/join teams."
                        }
                        {application.amount_paid > 0 && (
                            <><br /><span className="text-sm">Payment of ₹{application.amount_paid} completed successfully.</span></>
                        )}
                    </p>
                    {hackathon.registration_type === 'both' && application.looking_for_team && (
                        <div className="mt-4">
                            <PremiumButton
                                onClick={() => navigate('/teams')}
                                variant="secondary"
                            >
                                <Users className="w-4 h-4" />
                                Find or Create Team
                            </PremiumButton>
                        </div>
                    )}
                </div>
            )}

            {/* Rejected status */}
            {application.status === 'rejected' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <X className="w-6 h-6 text-red-600" />
                        <h4 className="font-bold text-red-800 dark:text-red-200">Application Rejected</h4>
                    </div>
                    <p className="text-red-700 dark:text-red-300">
                        Unfortunately, your application was not selected. The hackathon reached its capacity limit before your application could be confirmed.
                    </p>
                </div>
            )}
        </HeroCard>
    );
};

/* ─────────────────────────── Main Component ────────────────────────────── */
const HackathonRegister = () => {
    const { id } = useParams();
    const { user, theme } = useAuth();
    const navigate = useNavigate();

    const {
        toasts,
        success: showSuccess,
        error: showError,
        info: showInfo,
        warning: showWarning,
        hideToast
    } = useToast();

    // State management
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userApplication, setUserApplication] = useState(null);
    const [makingPayment, setMakingPayment] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);

    // Form state - Simplified for individual registration only
    const [step, setStep] = useState(0);
    const [lookingTeam, setLookingTeam] = useState(false);
    const [skills, setSkills] = useState(user?.skills ?? []);
    const [roles, setRoles] = useState([]);
    const [remoteCollab, setRemoteCollab] = useState(true);
    const [projectIdeas, setProjectIdeas] = useState('');

    // Form validation errors
    const [errors, setErrors] = useState({});

    const stepLabels = ['Registration Details', 'Additional Information'];

    // Helper to determine if team collaboration option should show
    const shouldShowTeamOption = () => {
        if (!hackathon) return false;
        // Only show team collaboration option if hackathon allows both types
        return hackathon.registration_type === 'both';
    };

    // Move success effect outside of return statement
    useEffect(() => {
        if (success && success.id) {
            const timer = setTimeout(() => {
                navigate(`/hackathons/applications/${success.id}`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    // Data fetching
    useEffect(() => {
        (async () => {
            try {
                const { success, data, error } = await hackathonServices.getHackathonById(id);
                if (success) {
                    setHackathon(data.hackathon);

                    // Check if current user is the organizer
                    if (user) {
                        const isCurrentUserOrganizer = (
                            data.hackathon.organizer === user.id ||
                            data.hackathon.organizer_id === user.id
                        );
                        setIsOrganizer(isCurrentUserOrganizer);

                        if (isCurrentUserOrganizer) {
                            showWarning('You are the organizer of this hackathon and cannot register');
                            return;
                        }

                        try {
                            const appResponse = await hackathonServices.getMyApplications();
                            if (appResponse.success) {
                                const existingApp = appResponse.data.applications.find(app => app.hackathon === parseInt(id));
                                if (existingApp) {
                                    navigate(`/hackathons/applications/${existingApp.id}`);
                                    return;
                                }
                            }
                        } catch (appError) {
                            showInfo('Ready to create new application');
                        }
                    }
                } else {
                    setError(error || 'Unable to fetch hackathon');
                    showError(error || 'Failed to load hackathon details');
                }
            } catch (err) {
                setError(err.message || 'Failed to load hackathon');
                showError(err.message || 'Failed to load hackathon details');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, user]);

    // Validation
    const validateStep = (stepNum) => {
        const newErrors = {};

        if (stepNum === 0) {
            if (skills.length === 0) {
                newErrors.skills = 'Please add at least one skill';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(0)) {
            setStep(1);
            showSuccess('Step 1 completed! Almost there...');
        } else {
            showWarning('Please fix the errors before continuing');
        }
    };

    // Updated handleSubmit with proper status logic
    const handleSubmit = async () => {
        if (!user) {
            showError('Please log in to submit your application');
            navigate('/login');
            return;
        }

        if (isOrganizer) {
            showError('You cannot register for your own hackathon!');
            return;
        }

        if (!validateStep(1)) {
            showWarning('Please fix any errors');
            return;
        }

        const now = new Date();
        const registrationStart = new Date(hackathon.registration_start);
        const registrationEnd = new Date(hackathon.registration_end);

        if (now < registrationStart) {
            showError('Registration has not started yet for this hackathon');
            return;
        }

        if (now > registrationEnd) {
            showError('Registration has ended for this hackathon');
            return;
        }

        // Determine if team collaboration is needed based on registration type
        let finalLookingTeam = false;
        if (hackathon.registration_type === 'team') {
            // Team required - set looking_for_team to true
            finalLookingTeam = true;
        } else if (hackathon.registration_type === 'both') {
            // Optional - use user's choice
            finalLookingTeam = lookingTeam;
        }
        // For 'individual' type, finalLookingTeam stays false
        console.log(roles)
        const payload = {
            hackathon: parseInt(id),
            application_type: 'individual',
            skills_bringing: skills,
            looking_for_team: finalLookingTeam,
            preferred_roles: roles,
            open_to_remote_collaboration: remoteCollab,
            project_ideas: projectIdeas || '',
        };

        console.log('Submitting payload:', payload);

        setSubmitting(true);
        showInfo('Submitting your application...');

        try {
            const { success, data, error } = await hackathonServices.applyToHackathon(id, payload);

            if (success) {
                const application = data.application;
                setSuccess(application);

                // Provide status-specific feedback
                if (application.status === 'confirmed') {
                    if (hackathon.registration_type === 'individual') {
                        showSuccess('🎉 Registration confirmed! You\'re all set for the individual hackathon!');
                    } else {
                        showSuccess('🎉 Registration confirmed! You can now form or join teams.');
                    }
                } else if (application.status === 'team_pending') {
                    showSuccess('✅ Registration successful! Team formation is required before the hackathon starts.');
                } else if (application.status === 'payment_pending') {
                    if (hackathon.confirmed_participants >= hackathon.max_participants) {
                        showWarning('Hackathon is full. Payment not required. Your application will be rejected.');
                    } else {
                        showSuccess('Application submitted! Please complete payment to confirm your participation.');
                        setTimeout(() => {
                            showWarning(`Payment of ₹${hackathon.registration_fee} required to confirm registration`);
                        }, 2000);
                    }
                } else if (application.status === 'applied') {
                    showSuccess('Application submitted successfully! You will be notified about confirmation.');
                }

            } else {
                if (error.includes('Already applied')) {
                    showError('You have already applied to this hackathon');
                    window.location.reload();
                } else if (error.includes('Organizers cannot apply')) {
                    showError('You cannot apply to your own hackathon!');
                    setIsOrganizer(true);
                } else {
                    showError(error || 'Failed to submit application. Please try again.');
                }
            }
        } catch (err) {
            console.error('Application submission error:', err);
            showError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Updated payment handler with proper status transitions
    const handleMakePayment = async () => {
        if (!userApplication || userApplication.status !== 'payment_pending') return;

        // Check if hackathon is still accepting confirmations
        if (hackathon.confirmed_participants >= hackathon.max_participants) {
            showError('Sorry, the hackathon has reached its maximum capacity. Payment is no longer accepted.');
            return;
        }

        setMakingPayment(true);
        showInfo('Processing payment...');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const paymentData = {
                amount_paid: hackathon.registration_fee,
                payment_id: `payment_${Date.now()}`,
            };

            const { success, data, error } = await hackathonServices.updateApplicationPayment(
                userApplication.id,
                paymentData
            );

            if (success) {
                setUserApplication(data.application);
                setHackathon(prev => ({ ...prev, confirmed_participants: prev.confirmed_participants + 1 }));

                // Check final status after payment
                if (data.application.status === 'confirmed') {
                    showSuccess('🎉 Payment confirmed! Your individual registration is complete!');
                } else if (data.application.status === 'team_pending') {
                    showSuccess('🎉 Payment confirmed! Now you need to form or join a team.');
                }
            } else {
                showError(error || 'Payment update failed');
            }

        } catch (err) {
            console.error('Payment confirmation error:', err);
            showError('Payment confirmation failed. Please try again.');
        } finally {
            setMakingPayment(false);
        }
    };

    /* Loading State */
    if (loading) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center px-4`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full mx-auto"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-2 border-2 border-purple-300 dark:border-purple-700 border-t-purple-600 dark:border-t-purple-400 rounded-full"
                        />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Loading Registration
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Preparing your hackathon experience...
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* Error State */
    if (error || !hackathon) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Hackathon not found.'}</p>
                    <PremiumButton onClick={() => navigate(`/hackathons/${id}`)} variant="outline">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Hackathon
                    </PremiumButton>
                </HeroCard>
            </div>
        );
    }

    /* Organizer Restriction State */
    if (isOrganizer && hackathon) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">You're the Organizer!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You cannot register for your own hackathon: <span className="font-semibold">{hackathon.title}</span>
                    </p>
                    <div className="space-y-3">
                        <PremiumButton onClick={() => navigate(`/hackathons/${id}`)} variant="primary">
                            <Trophy className="w-4 h-4" />
                            Manage Your Hackathon
                        </PremiumButton>
                        <PremiumButton onClick={() => navigate('/hackathons')} variant="outline">
                            <ArrowLeft className="w-4 h-4" />
                            Browse Other Hackathons
                        </PremiumButton>
                    </div>
                </HeroCard>
            </div>
        );
    }

    /* Registration Not Started State */
    if (new Date() < new Date(hackathon.registration_start)) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registration Hasn't Started</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Registration will open on {new Date(hackathon.registration_start).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    <div className="space-y-3">
                        <PremiumButton onClick={() => navigate(`/hackathons/${id}`)} variant="primary">
                            <Info className="w-4 h-4" />
                            View Hackathon Details
                        </PremiumButton>
                        <PremiumButton onClick={() => navigate('/hackathons')} variant="outline">
                            <ArrowLeft className="w-4 h-4" />
                            Browse Other Hackathons
                        </PremiumButton>
                    </div>
                </HeroCard>
            </div>
        );
    }

    /* Registration Closed */
    if (new Date() > new Date(hackathon.registration_end)) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registration Closed</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Registration ended on {new Date(hackathon.registration_end).toLocaleDateString()}
                    </p>
                    <PremiumButton onClick={() => navigate(`/hackathons/${id}`)} variant="primary">
                        View Hackathon Details
                    </PremiumButton>
                </HeroCard>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-lg text-center p-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                {success.status === 'confirmed' ? 'Registration Confirmed!' :
                                    success.status === 'team_pending' ? 'Team Formation Required!' :
                                        success.status === 'payment_pending' ? 'Payment Required!' :
                                            'Application Submitted!'}
                            </h2>
                            <div className="space-y-3">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Status: <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                                        {success.status.replace('_', ' ')}
                                    </span>
                                </p>

                                {success.status === 'confirmed' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Star className="w-5 h-5 text-green-600" />
                                        <span className="text-green-800 dark:text-green-200 font-semibold">
                                            {hackathon.registration_type === 'individual'
                                                ? 'Individual Registration Complete!'
                                                : hackathon.registration_type === 'team'
                                                    ? 'Registration Complete! Team formation required.'
                                                    : 'Registration Complete!'
                                            }
                                        </span>
                                    </div>
                                )}

                                {success.status === 'team_pending' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Users className="w-5 h-5 text-purple-600" />
                                        <span className="text-purple-800 dark:text-purple-200 font-semibold">
                                            Registration Complete! Team formation pending.
                                        </span>
                                    </div>
                                )}

                                {success.status === 'applied' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <span className="text-blue-800 dark:text-blue-200 font-semibold">
                                            Under Review - You will be notified about confirmation
                                        </span>
                                    </div>
                                )}

                                {success.status === 'payment_pending' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-orange-600" />
                                        <span className="text-orange-800 dark:text-orange-200 font-semibold">
                                            {hackathon.confirmed_participants >= hackathon.max_participants
                                                ? 'Hackathon Full - No Payment Required'
                                                : `Payment Required: ₹${hackathon.registration_fee}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <PremiumButton onClick={() => navigate(`/hackathons/${id}`)} variant="primary">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Hackathon
                        </PremiumButton>
                    </motion.div>
                </HeroCard>
            </div>
        );
    }

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900`}>

            {/* Toast Container */}
            <div className="fixed inset-0 pointer-events-none z-50">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        isVisible={true}
                        onClose={() => hideToast(toast.id)}
                        duration={0}
                        position="top-right"
                    />
                ))}
            </div>

            <div className="relative">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>

                    <div className="relative max-w-4xl mx-auto">
                        <motion.button
                            onClick={() => navigate(`/hackathons/${id}`)}
                            whileHover={{ scale: 1.05, x: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white/90 hover:text-white hover:bg-white/30 transition-all mb-8"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Hackathon</span>
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Join the Challenge
                            </h1>
                            <p className="text-xl sm:text-2xl text-indigo-100 mb-4 font-medium">
                                {hackathon.title}
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                {hackathon.is_free && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full text-green-100">
                                        <Star className="w-5 h-5" />
                                        <span className="font-semibold">FREE EVENT</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                                    <Trophy className="w-5 h-5" />
                                    <span className="font-semibold">₹{hackathon.total_prize_pool || 'TBD'} Prize Pool</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                                    <Users className="w-5 h-5" />
                                    <span className="font-semibold">{hackathon.confirmed_participants}/{hackathon.max_participants} Confirmed</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative -mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    {userApplication ? (
                        <ApplicationStatusCard
                            application={userApplication}
                            hackathon={hackathon}
                            onMakePayment={handleMakePayment}
                            makingPayment={makingPayment}
                        />
                    ) : (
                        <>
                            <div className="mb-12">
                                <ProgressIndicator
                                    currentStep={step}
                                    totalSteps={2}
                                    stepLabels={stepLabels}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 0 ? (
                                    <HeroCard key="step-1" className="p-8">
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                                    Registration Details
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                                    Tell us about yourself and your interests
                                                </p>
                                            </div>

                                            {/* Registration Type Info */}
                                            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    {hackathon.registration_type === 'individual' ? (
                                                        <>
                                                            <User className="w-8 h-8 text-blue-600" />
                                                            <div>
                                                                <h3 className="font-bold text-blue-900 dark:text-blue-100">Individual Only Hackathon</h3>
                                                                <p className="text-blue-700 dark:text-blue-300">This hackathon is for individual participants only. No team formation.</p>
                                                            </div>
                                                        </>
                                                    ) : hackathon.registration_type === 'team' ? (
                                                        <>
                                                            <Users className="w-8 h-8 text-blue-600" />
                                                            <div>
                                                                <h3 className="font-bold text-blue-900 dark:text-blue-100">Team Only Hackathon</h3>
                                                                <p className="text-blue-700 dark:text-blue-300">Everyone registers individually. Team formation is required after confirmation.</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="w-8 h-8 text-blue-600" />
                                                            <div>
                                                                <h3 className="font-bold text-blue-900 dark:text-blue-100">Individual Registration</h3>
                                                                <p className="text-blue-700 dark:text-blue-300">Everyone registers individually. Team formation is optional after confirmation.</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Team Interest Option - Only show if registration_type is 'both' */}
                                            {shouldShowTeamOption() && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700"
                                                >
                                                    <label className="flex items-center gap-4 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={lookingTeam}
                                                            onChange={() => {
                                                                setLookingTeam(!lookingTeam);
                                                                showInfo(!lookingTeam ? 'Marked as interested in team collaboration' : 'Removed team collaboration preference');
                                                            }}
                                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                        />
                                                        <div>
                                                            <span className="font-semibold text-gray-900 dark:text-white">Interested in team collaboration?</span>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">We'll help you find and connect with other participants for team formation</p>
                                                        </div>
                                                    </label>
                                                </motion.div>
                                            )}

                                            {/* Skills Section */}
                                            <div>
                                                <SmartTagSystem
                                                    label="Your Skills"
                                                    tags={skills}
                                                    setTags={(newSkills) => {
                                                        setSkills(newSkills);
                                                        if (newSkills.length > skills.length) {
                                                            showSuccess(`Added skill: ${newSkills[newSkills.length - 1]}`);
                                                        }
                                                        if (errors.skills) setErrors({ ...errors, skills: null });
                                                    }}
                                                    placeholder="Add your skills (React, Python, Design...)"
                                                    icon={Code2}
                                                    color="indigo"
                                                />
                                                {errors.skills && <p className="text-red-500 text-sm mt-2">{errors.skills}</p>}
                                            </div>

                                            <div className="flex justify-end pt-6">
                                                <PremiumButton
                                                    onClick={handleNextStep}
                                                    variant="primary"
                                                    disabled={skills.length === 0}
                                                >
                                                    Continue
                                                    <ChevronRight className="w-4 h-4" />
                                                </PremiumButton>
                                            </div>
                                        </motion.div>
                                    </HeroCard>
                                ) : (
                                    <HeroCard key="step-2" className="p-8">
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                                    Additional Information
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                                    Help us understand your preferences better
                                                </p>
                                            </div>

                                            <SmartTagSystem
                                                label="Preferred Roles"
                                                tags={roles}
                                                onChange={console.log(roles)}
                                                setTags={(newRoles) => {
                                                    { console.log(newRoles) }
                                                    setRoles(newRoles);
                                                    if (newRoles.length > roles.length) {
                                                        showSuccess(`Added role: ${newRoles[newRoles.length - 1]}`);
                                                    }
                                                }}
                                                placeholder="Frontend, Backend, Designer, Product Manager..."
                                                icon={Briefcase}
                                                color="emerald"
                                            />

                                            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <label className="flex items-center gap-4 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={remoteCollab}
                                                        onChange={() => {
                                                            setRemoteCollab(!remoteCollab);
                                                            showInfo(!remoteCollab ? 'Remote collaboration enabled' : 'Remote collaboration disabled');
                                                        }}
                                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <Globe className="w-5 h-5 text-indigo-500" />
                                                        <div>
                                                            <span className="font-semibold text-gray-900 dark:text-white">Open to remote collaboration</span>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Work with team members from anywhere</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <ModernTextArea
                                                label="Project Ideas (Optional)"
                                                placeholder="Share any project ideas or what you're excited to build in this hackathon..."
                                                value={projectIdeas}
                                                onChange={(e) => setProjectIdeas(e.target.value)}
                                                icon={Lightbulb}
                                            />

                                            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                                                <PremiumButton
                                                    onClick={() => {
                                                        setStep(0);
                                                        showInfo('Returned to previous step');
                                                    }}
                                                    variant="outline"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    Previous
                                                </PremiumButton>

                                                <PremiumButton
                                                    onClick={handleSubmit}
                                                    loading={submitting}
                                                    variant="secondary"
                                                    disabled={submitting || isOrganizer}
                                                >
                                                    {submitting ? (
                                                        'Submitting...'
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            {hackathon.is_free ? 'Confirm Registration' : 'Submit Application'}
                                                        </>
                                                    )}
                                                </PremiumButton>
                                            </div>
                                        </motion.div>
                                    </HeroCard>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HackathonRegister;
