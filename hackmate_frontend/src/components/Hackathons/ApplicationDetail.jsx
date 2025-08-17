// src/components/Hackathons/ApplicationDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Loader, Users, User, CheckCircle, Plus, X, Globe,
    Code2, Trophy, CreditCard, Clock, AlertTriangle, Star,
    XCircle,
    Group
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

const ApplicationDetail = () => {
    const { applicationId } = useParams();
    const { theme } = useAuth();
    const navigate = useNavigate();

    const {
        toasts,
        success: showSuccess,
        error: showError,
        info: showInfo,
        warning: showWarning,
        hideToast
    } = useToast();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [hackathon, setHackathon] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);
    const [makingPayment, setMakingPayment] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            const { success, data, error } = await hackathonServices.getApplicationDetails(applicationId);
            if (success) {
                setApplication(data.application);
                setHackathon(data.hackathon);
            } else {
                showError(error || 'Failed to load application details');
                navigate('/hackathons');
            }
        } catch (err) {
            showError('Failed to load application details');
            navigate('/hackathons');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawApplication = async () => {
        // Use toast instead of alert
        showWarning('Are you sure you want to withdraw your application?');

        // Create a confirmation toast with actions
        const confirmWithdraw = () => {
            setWithdrawing(true);
            showInfo('Processing withdrawal...');

            hackathonServices.withdrawApplication(applicationId)
                .then(({ success, data, error }) => {
                    if (success) {
                        setApplication(data.application);
                        showSuccess('Application withdrawn successfully');
                    } else {
                        showError(error || 'Failed to withdraw application');
                    }
                })
                .catch(() => {
                    showError('Failed to withdraw application');
                })
                .finally(() => {
                    setWithdrawing(false);
                });
        };

        // For simplicity, let's proceed directly (you can implement a confirmation modal later)
        confirmWithdraw();
    };

    const handleMakePayment = async () => {
        setMakingPayment(true);
        showInfo('Processing payment...');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const paymentData = {
                amount_paid: hackathon.registration_fee,
                payment_id: `payment_${Date.now()}`,
            };

            const { success, data, error } = await hackathonServices.updateApplicationPayment(
                applicationId,
                paymentData
            );

            if (success) {
                setApplication(data.application);
                showSuccess('🎉 Payment confirmed! Your registration is now complete!');

                setTimeout(() => {
                    if (application.application_type === 'team_leader') {
                        showInfo('Redirecting to team formation...');
                        navigate('/teams');
                    } else if (application.looking_for_team) {
                        showInfo('Redirecting to team matching...');
                        navigate('/matching');
                    }
                }, 2000);
            } else {
                showError(error || 'Payment update failed');
            }
        } catch (err) {
            showError('Payment confirmation failed. Please try again.');
        } finally {
            setMakingPayment(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            confirmed: { color: 'green', icon: CheckCircle, label: 'Confirmed', bg: 'bg-green-50 dark:bg-green-900/20' },
            payment_pending: { color: 'orange', icon: CreditCard, label: 'Payment Pending', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            applied: { color: 'blue', icon: Clock, label: 'Under Review', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            team_pending: { color: 'yellow', icon: Group, label: 'Team Pending', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            cancelled: { color: 'gray', icon: XCircle, label: 'Withdrawn', bg: 'bg-gray-50 dark:bg-gray-900/20' },
            rejected: { color: 'red', icon: X, label: 'Rejected', bg: 'bg-red-50 dark:bg-red-900/20' }
        };
        return configs[status] || configs.applied;
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
                            Loading Application
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Fetching your application details...
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* Error State */
    if (!application || !hackathon) {
        return (
            <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center px-4`}>
                <HeroCard className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Application Not Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">The application you're looking for doesn't exist or has been removed.</p>
                    <PremiumButton onClick={() => navigate('/hackathons')} variant="outline">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Hackathons
                    </PremiumButton>
                </HeroCard>
            </div>
        );
    }

    const statusConfig = getStatusConfig(application.status);
    const StatusIcon = statusConfig.icon;
    // ✅ Can only withdraw if not confirmed, cancelled, or rejected
    const canWithdraw = application.status !== 'cancelled' &&
        application.status !== 'rejected' &&
        application.status !== 'confirmed' &&
        application.payment_status !== 'completed' &&
        application.payment_status !== 'not_required';

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
                            onClick={() => navigate(`/hackathons/${hackathon.id}`)}
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
                                Your Application
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

                    {/* Application Detail Card - Same design as ApplicationStatusCard */}
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

                            {canWithdraw && (
                                <PremiumButton
                                    onClick={handleWithdrawApplication}
                                    disabled={withdrawing}
                                    variant="warning"
                                >
                                    {withdrawing ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                                </PremiumButton>
                            )}
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

                        {/* Payment pending section */}
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
                                    onClick={handleMakePayment}
                                    loading={makingPayment}
                                    disabled={makingPayment}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    {makingPayment ? 'Processing Payment...' : 'Complete Payment'}
                                </PremiumButton>
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
                                    You're all set for the hackathon. Check your email for further updates and event details.
                                    {application.amount_paid > 0 && (
                                        <><br /><span className="text-sm">Payment of ₹{application.amount_paid} completed successfully.</span></>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Action buttons for different statuses */}
                        <div className="mt-8 flex flex-wrap gap-4 justify-center">
                            {(application.status === 'confirmed' || application.status === 'team_pending') && application.application_type === 'team_leader' && (
                                <PremiumButton onClick={() => navigate('/teams')} variant="secondary">
                                    <Users className="w-4 h-4" />
                                    Manage Team
                                </PremiumButton>
                            )}

                            {application.status === 'team_pending' && application.looking_for_team && (
                                <PremiumButton onClick={() => navigate('/matching')} variant="secondary">
                                    <Users className="w-4 h-4" />
                                    Find Teams
                                </PremiumButton>
                            )}

                            {application.status === 'applied' && application.application_type === 'team_leader' && (
                                <PremiumButton onClick={() => navigate('/teams')} variant="secondary">
                                    <Users className="w-4 h-4" />
                                    Form Team
                                </PremiumButton>
                            )}
                        </div>
                    </HeroCard>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;
