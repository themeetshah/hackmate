/* --------------------------------------------------------------------------
   HackathonRegister.jsx · REDESIGNED PREMIUM EDITION WITH PAYMENT AND ORGANIZER PROTECTION
   Professional multi-step registration with enhanced UI/UX, payment logic, and organizer restrictions
   -------------------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Loader, Users, User, CheckCircle, Sparkles, Plus, X, Globe,
    Monitor, MapPin, Code2, Trophy, Target, Palette, Shield, Cpu, Database,
    Brain, Gamepad2, Edit, CreditCard, Calendar, Clock, AlertTriangle, Info,
    Star, Zap, ChevronRight, ChevronLeft, Award, Briefcase, Heart, Send, Lightbulb
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
        ghost: "bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600",
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

const ModernInput = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
            {label}
        </label>
        <motion.div
            whileFocus={{ scale: 1.01 }}
            className="relative group"
        >
            <input
                {...props}
                className={`w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 
                   ${error ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} 
                   rounded-xl text-gray-900 dark:text-white placeholder-gray-400 
                   focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 
                   focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300
                   backdrop-blur-sm`}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
);

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
        emerald: active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
        orange: active ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
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

/* ──────────────────────── Registration Type Cards ────────────────────────── */
const RegistrationTypeCard = ({ type, icon: Icon, title, description, selected, onClick, color, disabled = false }) => (
    <motion.button
        type="button"
        onClick={disabled ? undefined : onClick} // ✅ Disable onClick when disabled
        whileHover={disabled ? {} : { scale: 1.02, y: -2 }} // ✅ Disable hover animation when disabled
        whileTap={disabled ? {} : { scale: 0.98 }} // ✅ Disable tap animation when disabled
        disabled={disabled} // ✅ Add disabled attribute
        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left w-full
                ${disabled
                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed' // ✅ Disabled styles
                : selected
                    ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20 shadow-lg shadow-${color}-500/20`
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
    >
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${disabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500' // ✅ Disabled icon styles
                : selected
                    ? `bg-${color}-500 text-white`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2 ${disabled
                    ? 'text-gray-400 dark:text-gray-500' // ✅ Disabled title styles
                    : selected
                        ? `text-${color}-900 dark:text-${color}-100`
                        : 'text-gray-900 dark:text-white'
                    }`}>
                    {title}
                </h3>
                <p className={`text-sm leading-relaxed ${disabled
                    ? 'text-gray-400 dark:text-gray-500' // ✅ Disabled description styles
                    : 'text-gray-600 dark:text-gray-400'
                    }`}>
                    {description}
                </p>
            </div>
        </div>
        {selected && !disabled && ( // ✅ Only show checkmark if selected and not disabled
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute top-4 right-4 w-6 h-6 bg-${color}-500 rounded-full flex items-center justify-center`}
            >
                <CheckCircle className="w-4 h-4 text-white" />
            </motion.div>
        )}
    </motion.button>
);

/* ──────────────────────── Application Status Card ────────────────────────── */
const ApplicationStatusCard = ({ application, hackathon, onEdit, onMakePayment, makingPayment = false }) => {
    const getStatusConfig = (status) => {
        const configs = {
            confirmed: { color: 'green', icon: CheckCircle, label: 'Confirmed', bg: 'bg-green-50 dark:bg-green-900/20' },
            payment_pending: { color: 'orange', icon: CreditCard, label: 'Payment Pending', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            team_pending: { color: 'purple', icon: Users, label: 'Team Formation Pending', bg: 'bg-purple-50 dark:bg-purple-900/20' },
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
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${statusConfig.bg} border border-${statusConfig.color}-200 dark:border-${statusConfig.color}-800 mb-8`}>
                <StatusIcon className={`w-5 h-5 text-${statusConfig.color}-600`} />
                <span className={`font-bold text-${statusConfig.color}-800 dark:text-${statusConfig.color}-200`}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Application Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Registration Type</h3>
                        <div className="flex items-center gap-3">
                            {application.application_type === 'team_leader' ? (
                                <Users className="w-5 h-5 text-purple-500" />
                            ) : (
                                <User className="w-5 h-5 text-indigo-500" />
                            )}
                            <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                {application.application_type.replace('_', ' ')}
                            </span>
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
                    {application.preferred_team_size && (
                        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Team Size</h3>
                            <p className="font-semibold text-gray-900 dark:text-white">{application.preferred_team_size} members</p>
                        </div>
                    )}

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

            {/* Update the payment pending section in ApplicationStatusCard */}
            {application.status === 'payment_pending' && application.payment_status === 'pending' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                        <h4 className="font-bold text-orange-800 dark:text-orange-200">Payment Required</h4>
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 mb-4">
                        Complete your payment of <span className="font-bold">₹{hackathon.registration_fee}</span> to confirm your participation.
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

            {application.status === 'confirmed' && application.payment_status === 'completed' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-green-800 dark:text-green-200">Registration Confirmed!</h4>
                    </div>
                    <p className="text-green-700 dark:text-green-300">
                        You're all set for the hackathon. Check your email for further updates and event details.
                        {application.amount_paid > 0 && (
                            <><br /><span className="text-sm">Payment of ₹{application.amount_paid} completed successfully.</span></>
                        )}
                    </p>
                </div>
            )}
        </HeroCard>
    );
};

const checkRegistrationAvailability = (hackathon) => {
    const remainingSpots = hackathon.max_participants - hackathon.confirmed_participants;

    if (hackathon.registration_type === 'both') {
        return {
            canRegisterIndividual: remainingSpots > 0,
            canRegisterTeam: remainingSpots >= hackathon.min_team_size,
            remainingSpots
        };
    } else if (hackathon.registration_type === 'team') {
        return {
            canRegisterIndividual: false,
            canRegisterTeam: remainingSpots >= hackathon.min_team_size,
            remainingSpots
        };
    } else if (hackathon.registration_type === 'individual') {
        return {
            canRegisterIndividual: remainingSpots > 0,
            canRegisterTeam: false,
            remainingSpots
        };
    }

    return {
        canRegisterIndividual: false,
        canRegisterTeam: false,
        remainingSpots: 0
    };
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
    const [showEditForm, setShowEditForm] = useState(false);
    const [makingPayment, setMakingPayment] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);

    // Form state - Initialize with proper defaults
    const [step, setStep] = useState(0);
    const [regType, setRegType] = useState('individual'); // This will be updated based on hackathon constraints
    const [lookingTeam, setLookingTeam] = useState(false);
    const [skills, setSkills] = useState(user?.skills ?? []);
    const [roles, setRoles] = useState([]);
    const [prefTeamSize, setPrefTeamSize] = useState(2);
    const [remoteCollab, setRemoteCollab] = useState(true);
    const [projectIdeas, setProjectIdeas] = useState('');
    const [availability, setAvailability] = useState({})
    // Form validation errors
    const [errors, setErrors] = useState({});

    const stepLabels = ['Registration Details', 'Additional Information'];

    // Data fetching
    useEffect(() => {
        (async () => {
            try {
                const { success, data, error } = await hackathonServices.getHackathonById(id);
                if (success) {
                    setHackathon(data.hackathon);
                    setPrefTeamSize(data.hackathon.min_team_size);

                    // Check registration availability
                    const currentAvailability = checkRegistrationAvailability(data.hackathon);
                    setAvailability(currentAvailability);
                    console.log(data.hackathon.registration_type)
                    console.log(currentAvailability, availability)

                    if (currentAvailability.remainingSpots <= 0) {
                        showError('This hackathon is full. No more registrations accepted.');
                        return;
                    }

                    // ✅ FIX: Set proper default registration type based on hackathon constraints
                    const individualAllowed = ['individual', 'both'].includes(data.hackathon.registration_type);
                    const teamAllowed = ['team', 'both'].includes(data.hackathon.registration_type);

                    if (!individualAllowed && teamAllowed) {
                        if (currentAvailability.canRegisterTeam) {
                            setRegType('team');
                            showInfo('This hackathon only accepts team registrations');
                        } else {
                            showError('Not enough spots left for team formation');
                            return;
                        }
                    } else if (individualAllowed && !teamAllowed) {
                        // Individual only hackathon
                        if (currentAvailability.canRegisterIndividual) {
                            setRegType('individual');
                            showInfo('This hackathon only accepts individual registrations');
                        } else {
                            showError('No individual spots remaining');
                            return;
                        }
                        // } else if (data.hackathon.registration_type === 'both') {
                        //     console.log(currentAvailability)
                        //     if (!currentAvailability.canRegisterTeam) {
                        //         setRegType('individual');
                        //         showWarning('Team registration disabled - not enough spots left');
                        //     }
                    } else if (data.hackathon.registration_type === 'both') {
                        // Default to individual if team registration is not possible
                        if (!currentAvailability.canRegisterTeam && currentAvailability.canRegisterIndividual) {
                            setRegType('individual');
                            showWarning('Team registration disabled - not enough spots left');
                        } else if (!currentAvailability.canRegisterIndividual && currentAvailability.canRegisterTeam) {
                            setRegType('team');
                            showWarning('Individual registration disabled - insufficient spots');
                        } else if (!currentAvailability.canRegisterIndividual && !currentAvailability.canRegisterTeam) {
                            showError('Registration is full');
                            return;
                        }
                        // If both are available, keep default 'individual'
                    }

                    // Check if current user is the organizer
                    if (user) {
                        const isCurrentUserOrganizer = (
                            data.hackathon.organizer === user.id ||
                            data.hackathon.organizer_id === user.id
                        );
                        setIsOrganizer(isCurrentUserOrganizer);

                        if (isCurrentUserOrganizer) {
                            showWarning('You are the organizer of this hackathon and cannot register');
                            return; // Don't fetch applications if organizer
                        }

                        try {
                            const appResponse = await hackathonServices.getMyApplications();
                            if (appResponse.success) {
                                const existingApp = appResponse.data.applications.find(app => app.hackathon === parseInt(id));
                                if (existingApp) {
                                    // Redirect to application detail page instead of showing status card
                                    navigate(`/hackathons/applications/${existingApp.id}`);
                                    return;
                                }
                                // if (existingApp) {
                                //     setUserApplication(existingApp);
                                //     setRegType(existingApp.application_type === 'team_leader' ? 'team' : 'individual');
                                //     setLookingTeam(existingApp.looking_for_team || false);
                                //     setSkills(existingApp.skills_bringing || []);
                                //     setRoles(existingApp.preferred_roles || []);
                                //     setPrefTeamSize(existingApp.preferred_team_size || data.hackathon.min_team_size);
                                //     setRemoteCollab(existingApp.open_to_remote_collaboration ?? true);
                                //     setProjectIdeas(existingApp.project_ideas || '');
                                //     showInfo('Found your existing application');
                                // }
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
    }, [id, user, navigate]);

    // Validation
    const validateStep = (stepNum) => {
        const newErrors = {};

        if (stepNum === 0) {
            if (skills.length === 0) {
                newErrors.skills = 'Please add at least one skill';
            }
            if (regType === 'team' && prefTeamSize < hackathon.min_team_size) {
                newErrors.teamSize = `Team size must be at least ${hackathon.min_team_size} members`;
            }
            if (regType === 'team' && prefTeamSize > hackathon.max_team_size) {
                newErrors.teamSize = `Team size cannot exceed ${hackathon.max_team_size} members`;
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

    // Update the handleSubmit function for proper redirects
    const handleSubmit = async () => {
        if (!user) {
            showError('Please log in to submit your application');
            navigate('/login');
            return;
        }

        // Double-check organizer status before submission
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

        if (hackathon.confirmed_participants >= hackathon.max_participants) {
            showError('This hackathon is full. No more registrations accepted.');
            return;
        }

        // Prepare complete and correct payload
        const payload = {
            hackathon: parseInt(id),
            application_type: regType === 'team' ? 'team_leader' : 'individual',
            skills_bringing: skills,
            looking_for_team: regType === 'individual' ? lookingTeam : false,
            preferred_team_size: regType === 'team' ? prefTeamSize : null,
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

                if (application.status === 'confirmed') {
                    showSuccess('🎉 Registration confirmed! You\'re all set for the hackathon!');

                    // Update confirmed participants count
                    setHackathon(prev => ({
                        ...prev,
                        confirmed_participants: prev.confirmed_participants + 1
                    }));

                    // Handle redirects based on registration type
                    if (regType === 'individual' && !lookingTeam) {
                        setTimeout(() => {
                            showInfo('You\'re registered as a solo participant. Good luck!');
                        }, 2000);
                    } else if (lookingTeam) {
                        setTimeout(() => {
                            showInfo('Redirecting to team matching...');
                            navigate('/matching');
                        }, 3000);
                    }
                } else if (application.status === 'applied') {
                    showSuccess('Application submitted successfully!');

                    if (regType === 'team') {
                        setTimeout(() => {
                            showInfo('Redirecting to team formation...');
                            navigate('/teams');
                        }, 3000);
                    } else if (lookingTeam) {
                        setTimeout(() => {
                            showInfo('Redirecting to team matching...');
                            navigate('/matching');
                        }, 3000);
                    }
                } else if (application.status === 'payment_pending') {
                    showSuccess('Application submitted! Please complete payment to confirm your participation.');
                    setTimeout(() => {
                        showWarning(`Payment of ₹${hackathon.registration_fee} required to confirm registration`);
                    }, 2000);
                }

            } else {
                if (error.includes('Already applied')) {
                    showError('You have already applied to this hackathon');
                    window.location.reload();
                } else if (error.includes('full') || error.includes('capacity')) {
                    showError('This hackathon is full. Try joining the waitlist!');
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

    // Update the payment handler
    const handleMakePayment = async () => {
        if (!userApplication || userApplication.status !== 'payment_pending') return;

        setMakingPayment(true);
        showInfo('Processing payment...');

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update payment via backend
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

                // Update hackathon confirmed participants count
                setHackathon(prev => ({ ...prev, confirmed_participants: prev.confirmed_participants + 1 }));

                showSuccess('🎉 Payment confirmed! Your registration is now complete!');

                // Handle post-payment redirects
                setTimeout(() => {
                    if (userApplication.application_type === 'team_leader') {
                        showInfo('Redirecting to team formation...');
                        navigate('/teams');
                    } else if (userApplication.looking_for_team) {
                        showInfo('Redirecting to team matching...');
                        navigate('/matching');
                    } else {
                        showInfo('Welcome to the hackathon! Check your email for further details.');
                    }
                }, 2000);
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

    // Update the success state to show proper messages and handle redirects
    useEffect(() => {
        if (success && success.id) {
            const timer = setTimeout(() => {
                navigate(`/hackathons/applications/${success.id}`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    if (success && !showEditForm) {
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
                                    success.status === 'payment_pending' ? 'Payment Required!' :
                                        'Application Submitted!'}
                            </h2>
                            <div className="space-y-3">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Status: <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                                        {success.status.replace('_', ' ')}
                                    </span>
                                </p>

                                {/* Status-specific messages with redirects */}
                                {success.status === 'confirmed' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Star className="w-5 h-5 text-green-600" />
                                        <span className="text-green-800 dark:text-green-200 font-semibold">
                                            {success.application_type === 'individual' && !success.looking_for_team
                                                ? 'Solo Registration Complete!'
                                                : 'Registration Complete!'}
                                        </span>
                                    </div>
                                )}

                                {success.status === 'applied' && success.application_type === 'team_leader' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Users className="w-5 h-5 text-purple-600" />
                                        <span className="text-purple-800 dark:text-purple-200 font-semibold">
                                            Team Leader Registered! Redirecting to team formation...
                                        </span>
                                    </div>
                                )}

                                {success.status === 'applied' && success.looking_for_team && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="text-blue-800 dark:text-blue-200 font-semibold">
                                            Looking for team! Redirecting to matching...
                                        </span>
                                    </div>
                                )}

                                {success.status === 'payment_pending' && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-orange-600" />
                                        <span className="text-orange-800 dark:text-orange-200 font-semibold">
                                            Payment Required: ₹{hackathon.registration_fee}
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
    const shouldShowForm = !userApplication || showEditForm;
    const individualAllowed = ['individual', 'both'].includes(hackathon.registration_type);
    const teamAllowed = ['team', 'both'].includes(hackathon.registration_type);

    // Add these condition checks after the existing state checks and before the main form

    /* ─────── Registration Availability Checks ─────── */

    // Check if hackathon is completely full
    if (availability.remainingSpots <= 0) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registration Full</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This hackathon has reached its maximum capacity of {hackathon.max_participants} participants.
                    </p>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                        <p className="text-red-800 dark:text-red-200 text-sm">
                            🚫 No spots remaining ({hackathon.confirmed_participants}/{hackathon.max_participants})
                        </p>
                    </div>
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

    // Check if registration type is individual-only but no individual spots available
    if (hackathon.registration_type === 'individual' && !availability.canRegisterIndividual) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Individual Registration Unavailable</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This hackathon only accepts individual registrations, but no individual spots are currently available.
                    </p>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-orange-600" />
                            <div className="text-left">
                                <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">Individual Registration Only</p>
                                <p className="text-orange-700 dark:text-orange-300 text-xs">
                                    {availability.remainingSpots} spots remaining, but individual registration is full
                                </p>
                            </div>
                        </div>
                    </div>
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

    // Check if registration type is team-only but no team spots available
    if (hackathon.registration_type === 'team' && !availability.canRegisterTeam) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Team Registration Unavailable</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This hackathon only accepts team registrations, but insufficient spots remain for team formation.
                    </p>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div className="text-left">
                                <p className="text-purple-800 dark:text-purple-200 text-sm font-medium">Team Registration Only</p>
                                <p className="text-purple-700 dark:text-purple-300 text-xs">
                                    Only {availability.remainingSpots} spots left (need {hackathon.min_team_size} for team formation)
                                </p>
                            </div>
                        </div>
                    </div>
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

    // Check if registration type is both but neither individual nor team registration is available
    if (hackathon.registration_type === 'both' && !availability.canRegisterIndividual && !availability.canRegisterTeam) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-lg text-center p-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registration Unavailable</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Neither individual nor team registration is currently available for this hackathon.
                    </p>

                    {/* Show both registration types and their status */}
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="text-left flex-1">
                                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Individual Registration</p>
                                    <p className="text-gray-500 dark:text-gray-500 text-xs">No individual spots available</p>
                                </div>
                                <X className="w-4 h-4 text-red-500" />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-500" />
                                <div className="text-left flex-1">
                                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Team Registration</p>
                                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                                        Only {availability.remainingSpots} spots left (need {hackathon.min_team_size} minimum)
                                    </p>
                                </div>
                                <X className="w-4 h-4 text-red-500" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                        <p className="text-red-800 dark:text-red-200 text-sm">
                            🚫 Registration capacity issue: {availability.remainingSpots} spots remaining out of {hackathon.max_participants}
                        </p>
                    </div>

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

    // If registration type is 'both' but only one type is available, show limited availability message
    if (hackathon.registration_type === 'both' && (!availability.canRegisterIndividual || !availability.canRegisterTeam)) {
        const availableType = availability.canRegisterIndividual ? 'individual' : 'team';
        const unavailableType = !availability.canRegisterIndividual ? 'individual' : 'team';

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
                                    Limited Registration
                                </h1>
                                <p className="text-xl sm:text-2xl text-indigo-100 mb-4 font-medium">
                                    {hackathon.title}
                                </p>
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                                        <Trophy className="w-5 h-5" />
                                        <span className="font-semibold">₹{hackathon.total_prize_pool || 'TBD'} Prize Pool</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                                        <Users className="w-5 h-5" />
                                        <span className="font-semibold">{hackathon.confirmed_participants}/{hackathon.max_participants} Registered</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="relative -mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                        <HeroCard className="p-8 text-center">
                            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Limited Registration Options
                            </h2>

                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                Due to limited spots, only {availableType} registration is currently available.
                            </p>

                            {/* Show registration status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Available Registration Type */}
                                <div className={`p-6 rounded-2xl border-2 ${availableType === 'individual'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${availableType === 'individual'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-green-500 text-white'
                                            }`}>
                                            {availableType === 'individual' ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-lg text-green-900 dark:text-green-100 capitalize">
                                                {availableType} Registration
                                            </h3>
                                            <p className="text-green-700 dark:text-green-300 text-sm">
                                                ✅ Available for registration
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Unavailable Registration Type */}
                                <div className="p-6 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-75">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-gray-300 dark:bg-gray-600 text-gray-500">
                                            {unavailableType === 'individual' ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-lg text-gray-500 dark:text-gray-400 capitalize">
                                                {unavailableType} Registration
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                ❌ {unavailableType === 'individual'
                                                    ? 'No individual spots available'
                                                    : `Need ${hackathon.min_team_size} spots for team (${availability.remainingSpots} left)`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Continue to Registration Button */}
                            <div className="space-y-4">
                                <PremiumButton
                                    onClick={() => {
                                        // Continue to registration form with the available type pre-selected
                                        showInfo(`Continuing with ${availableType} registration`);
                                        // The form will render normally with the type restrictions
                                    }}
                                    variant="primary"
                                    className="w-full sm:w-auto"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Continue with {availableType.charAt(0).toUpperCase() + availableType.slice(1)} Registration
                                </PremiumButton>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <PremiumButton onClick={() => navigate(`/hackathons/${id}`)} variant="outline">
                                        <Info className="w-4 h-4" />
                                        View Hackathon Details
                                    </PremiumButton>
                                    <PremiumButton onClick={() => navigate('/hackathons')} variant="outline">
                                        <ArrowLeft className="w-4 h-4" />
                                        Browse Other Hackathons
                                    </PremiumButton>
                                </div>
                            </div>
                        </HeroCard>
                    </div>
                </div>
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
                                {userApplication && !showEditForm ? 'Your Application' : 'Join the Challenge'}
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
                                    <span className="font-semibold">{hackathon.confirmed_participants}/{hackathon.max_participants} Registered</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative -mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    {userApplication && !showEditForm ? (
                        <ApplicationStatusCard
                            application={userApplication}
                            hackathon={hackathon}
                            onEdit={() => setShowEditForm(true)}
                            onMakePayment={handleMakePayment}
                            makingPayment={makingPayment}
                        />
                    ) : (
                        <>

                            {!userApplication && (
                                <div className="mb-12">
                                    <ProgressIndicator
                                        currentStep={step}
                                        totalSteps={2}
                                        stepLabels={stepLabels}
                                    />
                                </div>
                            )}

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
                                                    Tell us how you want to participate
                                                </p>
                                            </div>

                                            {/* Registration Type Selection */}
                                            {/* Update the RegistrationTypeCard usage in the main form */}
                                            {individualAllowed && teamAllowed && (
                                                <div className="space-y-4">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                        Choose Your Path
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <RegistrationTypeCard
                                                            type="individual"
                                                            icon={User}
                                                            title="Solo Journey"
                                                            description={availability.canRegisterIndividual
                                                                ? "Register as an individual and showcase your skills independently"
                                                                : `No individual spots available (${availability.remainingSpots} left)`
                                                            }
                                                            selected={regType === 'individual'}
                                                            onClick={() => {
                                                                if (availability.canRegisterIndividual) {
                                                                    setRegType('individual');
                                                                    showInfo('Individual registration selected');
                                                                } else {
                                                                    showError('No spots left for individual registration');
                                                                }
                                                            }}
                                                            color="indigo"
                                                            disabled={!availability.canRegisterIndividual} // ✅ Add disabled prop
                                                        />
                                                        <RegistrationTypeCard
                                                            type="team"
                                                            icon={Users}
                                                            title="Team Leader"
                                                            description={availability.canRegisterTeam
                                                                ? "Lead a team and collaborate to build something amazing together"
                                                                : `Need ${hackathon.min_team_size} spots for team registration (${availability.remainingSpots} left)`
                                                            }
                                                            selected={regType === 'team'}
                                                            onClick={() => {
                                                                if (availability.canRegisterTeam) {
                                                                    setRegType('team');
                                                                    showInfo('Team leader registration selected');
                                                                } else {
                                                                    showError('Not enough spots left for team formation');
                                                                }
                                                            }}
                                                            color="purple"
                                                            disabled={!availability.canRegisterTeam} // ✅ Add disabled prop
                                                        />
                                                    </div>

                                                    {/* Warning when team registration is disabled */}
                                                    {!availability.canRegisterTeam && availability.canRegisterIndividual && (
                                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                                                ⚠️ Team registration disabled: Only {availability.remainingSpots} spots remaining (need {hackathon.min_team_size} for team formation)
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* When hackathon is completely full */}
                                                    {!availability.canRegisterIndividual && !availability.canRegisterTeam && (
                                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                            <p className="text-red-800 dark:text-red-200 text-sm">
                                                                🚫 Registration full: No spots remaining ({hackathon.confirmed_participants}/{hackathon.max_participants})
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}


                                            {/* Single type info */}
                                            {!individualAllowed && (
                                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <Users className="w-8 h-8 text-blue-600" />
                                                        <div>
                                                            <h3 className="font-bold text-blue-900 dark:text-blue-100">Team Registration Only</h3>
                                                            <p className="text-blue-700 dark:text-blue-300">This hackathon accepts team registrations only</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {!teamAllowed && (
                                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <User className="w-8 h-8 text-blue-600" />
                                                        <div>
                                                            <h3 className="font-bold text-blue-900 dark:text-blue-100">Individual Registration Only</h3>
                                                            <p className="text-blue-700 dark:text-blue-300">This hackathon accepts individual registrations only</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Individual Options */}
                                            {regType === 'individual' && individualAllowed && (
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
                                                                showInfo(!lookingTeam ? 'Marked as looking for team' : 'Removed team seeking preference');
                                                            }}
                                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                        />
                                                        <div>
                                                            <span className="font-semibold text-gray-900 dark:text-white">Looking for a team?</span>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">We'll help match you with other participants</p>
                                                        </div>
                                                    </label>
                                                </motion.div>
                                            )}

                                            {/* Team Options */}
                                            {regType === 'team' && teamAllowed && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-4"
                                                >
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Preferred Team Size
                                                        </label>
                                                        <select
                                                            value={prefTeamSize}
                                                            onChange={(e) => {
                                                                setPrefTeamSize(Number(e.target.value));
                                                                showInfo(`Team size set to ${e.target.value} members`);
                                                            }}
                                                            className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-600 
                                         rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 
                                         dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                        >
                                                            {Array.from(
                                                                { length: hackathon.max_team_size - hackathon.min_team_size + 1 },
                                                                (_, i) => hackathon.min_team_size + i
                                                            ).map(size => (
                                                                <option key={size} value={size}>{size} members</option>
                                                            ))}
                                                        </select>
                                                        {errors.teamSize && <p className="text-red-500 text-sm mt-1">{errors.teamSize}</p>}
                                                    </div>
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

                                            {/* In the step 0 continue button */}
                                            <div className="flex justify-end pt-6">
                                                <PremiumButton
                                                    onClick={handleNextStep}
                                                    variant="primary"
                                                    disabled={
                                                        skills.length === 0 || // ✅ Disable if no skills
                                                        (regType === 'team' && !availability.canRegisterTeam) || // ✅ Disable if team selected but can't register team
                                                        (regType === 'individual' && !availability.canRegisterIndividual) // ✅ Disable if individual selected but can't register individual
                                                    }
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
                                                setTags={(newRoles) => {
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
                                                    disabled={
                                                        submitting ||
                                                        isOrganizer ||
                                                        !availability.canRegisterIndividual && !availability.canRegisterTeam || // ✅ Disable if no spots available
                                                        (regType === 'team' && !availability.canRegisterTeam) || // ✅ Disable if team selected but can't register team
                                                        (regType === 'individual' && !availability.canRegisterIndividual) // ✅ Disable if individual selected but can't register individual
                                                    }
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
