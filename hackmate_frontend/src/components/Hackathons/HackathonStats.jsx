import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import hackathonServices from "../../api/hackathonServices";
import { motion, AnimatePresence } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
    Users, Trophy, Calendar, MapPin, DollarSign, Eye,
    Settings, ArrowLeft, Download, Share2, BarChart3,
    TrendingUp, UserCheck, Clock, AlertCircle, Star,
    CheckCircle, X, Filter, Search, RefreshCw, Edit,
    ExternalLink, Mail, Phone, Globe, Award, Target,
    Activity, PieChart, LineChart, UserPlus, Zap,
    FileText, Hash, ChevronRight
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Trend Chart Component
// Updated Trend Chart Component with Real Backend Data
const TrendChart = ({ applications, hackathon }) => {
    const generateChartData = () => {
        // Generate last 12 months labels
        const labels = [];
        const monthsData = {};

        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            labels.push(monthLabel);
            monthsData[monthKey] = {
                newApplications: 0,
                confirmed: 0,
                rejected: 0,
                pending: 0
            };
        }

        // Process real application data
        applications.forEach(app => {
            if (app.applied_at) {
                const appDate = new Date(app.applied_at);
                const monthKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;

                if (monthsData[monthKey]) {
                    monthsData[monthKey].newApplications += 1;

                    switch (app.status) {
                        case 'confirmed':
                            monthsData[monthKey].confirmed += 1;
                            break;
                        case 'rejected':
                            monthsData[monthKey].rejected += 1;
                            break;
                        case 'applied':
                        case 'team_pending':
                        case 'payment_pending':
                            monthsData[monthKey].pending += 1;
                            break;
                    }
                }
            }
        });

        // Convert to arrays for chart
        const newApplicationsData = labels.map((_, index) => {
            const monthKey = Object.keys(monthsData)[index];
            return monthsData[monthKey]?.newApplications || 0;
        });

        const confirmedData = labels.map((_, index) => {
            const monthKey = Object.keys(monthsData)[index];
            return monthsData[monthKey]?.confirmed || 0;
        });

        const rejectedData = labels.map((_, index) => {
            const monthKey = Object.keys(monthsData)[index];
            return monthsData[monthKey]?.rejected || 0;
        });

        const pendingData = labels.map((_, index) => {
            const monthKey = Object.keys(monthsData)[index];
            return monthsData[monthKey]?.pending || 0;
        });

        return {
            labels,
            datasets: [
                {
                    label: 'New Applications',
                    data: newApplicationsData,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                // {
                //     label: 'Confirmed Participants',
                //     data: confirmedData,
                //     borderColor: 'rgba(34, 197, 94, 1)',
                //     backgroundColor: 'rgba(34, 197, 94, 0.1)',
                //     fill: true,
                //     tension: 0.4,
                //     pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                //     pointBorderColor: '#ffffff',
                //     pointBorderWidth: 2,
                //     pointRadius: 5,
                //     pointHoverRadius: 7,
                // },
                // {
                //     label: 'Rejected Applications',
                //     data: rejectedData,
                //     borderColor: 'rgba(239, 68, 68, 1)',
                //     backgroundColor: 'rgba(239, 68, 68, 0.1)',
                //     fill: false,
                //     tension: 0.4,
                //     pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                //     pointBorderColor: '#ffffff',
                //     pointBorderWidth: 2,
                //     pointRadius: 4,
                //     pointHoverRadius: 6,
                //     borderDash: [5, 5], // Dashed line for rejected
                // }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    generateLabels: function (chart) {
                        const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
                        const labels = original.call(this, chart);

                        // Add custom styling for each label
                        labels.forEach((label, index) => {
                            if (index === 2) { // Rejected applications
                                label.lineDash = [5, 5];
                            }
                        });

                        return labels;
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: true,
                intersect: false,
                mode: 'index',
                callbacks: {
                    title: function (context) {
                        return `${context[0].label}`;
                    },
                    label: function (context) {
                        const label = context.dataset.label;
                        const value = context.parsed.y;
                        return `${label}: ${value} ${value === 1 ? 'application' : 'applications'}`;
                    },
                    footer: function (tooltipItems) {
                        let total = 0;
                        tooltipItems.forEach(function (tooltipItem) {
                            if (tooltipItem.datasetIndex !== 2) { // Exclude rejected from total
                                total += tooltipItem.parsed.y;
                            }
                        });
                        return total > 0 ? `Total Active: ${total}` : '';
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    stepSize: 1, // Ensure integer steps for application counts
                    callback: function (value) {
                        if (value % 1 === 0) {
                            return value;
                        }
                    }
                }
            }
        },
        elements: {
            point: {
                hoverBorderWidth: 3,
                hoverRadius: 8
            }
        }
    };

    // Calculate some insights from the data
    const totalApplications = applications.length;
    const currentMonthApplications = applications.filter(app => {
        if (!app.applied_at) return false;
        const appDate = new Date(app.applied_at);
        const currentDate = new Date();
        return appDate.getMonth() === currentDate.getMonth() &&
            appDate.getFullYear() === currentDate.getFullYear();
    }).length;

    const previousMonthApplications = applications.filter(app => {
        if (!app.applied_at) return false;
        const appDate = new Date(app.applied_at);
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        return appDate.getMonth() === previousMonth.getMonth() &&
            appDate.getFullYear() === previousMonth.getFullYear();
    }).length;

    const growthRate = previousMonthApplications > 0
        ? (((currentMonthApplications - previousMonthApplications) / previousMonthApplications) * 100).toFixed(1)
        : currentMonthApplications > 0 ? 100 : 0;

    const isGrowthPositive = parseFloat(growthRate) >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Application Trends
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            This month: <span className="font-semibold">{currentMonthApplications}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${isGrowthPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <TrendingUp className={`w-3 h-3 ${isGrowthPositive ? '' : 'rotate-180'}`} />
                            <span>{Math.abs(parseFloat(growthRate))}% vs last month</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Download Chart Data"
                        onClick={() => {
                            const chartData = generateChartData();
                            const csvContent = "data:text/csv;charset=utf-8," +
                                "Month,New Applications,Confirmed,Rejected\n" +
                                chartData.labels.map((label, index) =>
                                    `${label},${chartData.datasets[0].data[index]},${chartData.datasets[1].data[index]},${chartData.datasets[2].data[index]}`
                                ).join("\n");

                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `${hackathon?.title || 'hackathon'}_trend_data.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Share Chart"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `${hackathon?.title} - Application Trends`,
                                    text: `Check out the application trends for ${hackathon?.title}`,
                                    url: window.location.href
                                });
                            } else {
                                // Fallback: copy URL to clipboard
                                navigator.clipboard.writeText(window.location.href).then(() => {
                                    alert('Link copied to clipboard!');
                                });
                            }
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div style={{ height: '350px' }}>
                {applications.length > 0 ? (
                    <Line data={generateChartData()} options={chartOptions} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No Application Data</p>
                            <p className="text-sm mt-1">Charts will appear once applications are received</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart Summary */}
            {/* {applications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {totalApplications}
                            </div>
                            <div className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                Total Applications
                            </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {applications.filter(app => app.status === 'confirmed').length}
                            </div>
                            <div className="text-xs text-green-600/80 dark:text-green-400/80">
                                Confirmed
                            </div>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {applications.filter(app => app.status === 'rejected').length}
                            </div>
                            <div className="text-xs text-red-600/80 dark:text-red-400/80">
                                Rejected
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
        </motion.div>
    );
};

// Enhanced Hackathon Details Component
const HackathonDetailsCard = ({ hackathon }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'TBD';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
        >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Hackathon Details
            </h3>

            <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Event Duration</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="block">Start: {formatDate(hackathon.start_date)} at {formatTime(hackathon.start_time)}</span>
                                    <span className="block">End: {formatDate(hackathon.end_date)} at {formatTime(hackathon.end_time)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Location</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                    {hackathon.mode || 'Online'}
                                    {hackathon.location && hackathon.mode !== 'online' && (
                                        <span className="block">{hackathon.location}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Capacity</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Maximum {hackathon.max_participants || 'Unlimited'} participants
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Trophy className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Prize Pool</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ₹{hackathon.total_prize_pool?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Activity className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Status</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                    {hackathon.status?.replace('_', ' ') || 'Draft'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Hash className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Hackathon ID</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    #{hackathon.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {hackathon.description && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            <p>{hackathon.description}</p>
                        </div>
                    </div>
                )}

                {/* Registration Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Registration Period</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Registration Start</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDate(hackathon.registration_start)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Registration End</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDate(hackathon.registration_end)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tags/Categories */}
                {hackathon.tags && hackathon.tags.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {hackathon.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Stats Card Component (unchanged)
const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                {loading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                ) : (
                    <h3 className={`text-3xl font-bold ${color} mb-1`}>{value}</h3>
                )}
                {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`w-4 h-4 ${trend.positive ? '' : 'rotate-180'}`} />
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/30' :
                color.includes('green') ? 'bg-green-100 dark:bg-green-900/30' :
                    color.includes('purple') ? 'bg-purple-100 dark:bg-purple-900/30' :
                        color.includes('yellow') ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-gray-100 dark:bg-gray-900/30'}`}>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
        </div>
    </motion.div>
);

// Application Status Badge (unchanged)
const ApplicationStatusBadge = ({ status }) => {
    const statusConfig = {
        confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
        applied: { label: "Applied", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Clock },
        rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: X },
        team_pending: { label: "Team Pending", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Users },
        payment_pending: { label: "Payment Due", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.applied;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

// Applications Table (fixed filter logic)
const ApplicationsTable = ({ applications, loading, searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'applied', label: 'Applied' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'team_pending', label: 'Team Pending' },
        { value: 'payment_pending', label: 'Payment Due' }
    ];

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter; // Fixed comparison operators
        return matchesSearch && matchesStatus;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
        >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Applications ({filteredApplications.length})
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || statusFilter !== 'all' ? 'No applications match your filters' : 'No applications yet'}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Applicant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Applied
                                </th>
                                {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredApplications.map((application, index) => (
                                <motion.tr
                                    key={application.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {application.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {application.user_name || 'Unknown User'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {application.user_email || 'No email'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="capitalize text-sm text-gray-900 dark:text-white">
                                            {application.application_type || 'Individual'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ApplicationStatusBadge status={application.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Unknown'}
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                            View
                                        </button>
                                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                            Approve
                                        </button>
                                    </td> */}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );
};

// Main Component
export default function HackathonStats() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [hackathon, setHackathon] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Check authorization and fetch data
    const fetchHackathonData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch hackathon details
            const hackathonResponse = await hackathonServices.getHackathonById(id);
            if (!hackathonResponse.success) {
                throw new Error("Hackathon not found");
            }

            const hackathonData = hackathonResponse.data.hackathon || hackathonResponse.data;

            // Check if user is the organizer (fixed comparison operators)
            if (hackathonData.organizer !== user?.id && hackathonData.organizer_id !== user?.id) {
                setError("You are not authorized to view this hackathon's statistics");
                return;
            }

            setHackathon(hackathonData);

            // Fetch applications for this hackathon
            try {
                const applicationsResponse = await hackathonServices.getHackathonApplications(id);
                if (applicationsResponse.success) {
                    setApplications(applicationsResponse.applications || []);
                }
            } catch (appError) {
                console.error("Failed to fetch applications:", appError);
                // Don't set error, just show empty applications
            }

        } catch (err) {
            console.error("Error fetching hackathon data:", err);
            setError(err.message || "Failed to load hackathon data");
        } finally {
            setLoading(false);
        }
    }, [id, user?.id]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchHackathonData();
    }, [user, fetchHackathonData, navigate]);

    // Calculate statistics
    const stats = React.useMemo(() => {
        if (!hackathon || !applications) return {};

        const totalApplications = applications.length;
        const confirmedApplications = applications.filter(app => app.status === 'confirmed').length;
        const pendingApplications = applications.filter(app => app.status === 'applied').length;
        const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

        const registrationProgress = hackathon.max_participants ?
            Math.round((confirmedApplications / hackathon.max_participants) * 100) : 0;

        return {
            totalApplications,
            confirmedApplications,
            pendingApplications,
            rejectedApplications,
            registrationProgress,
            spotsRemaining: Math.max(0, (hackathon.max_participants || 0) - confirmedApplications)
        };
    }, [hackathon, applications]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <motion.div
                                className="w-16 h-16 mx-auto mb-6"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="w-full h-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full"></div>
                            </motion.div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Loading Hackathon Statistics
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Please wait while we fetch your data...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                                Access Denied
                            </h3>
                            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate("/hackathons")}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                >
                                    Back to Hackathons
                                </button>
                                <button
                                    onClick={() => navigate("/hackathons/my")}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                >
                                    My Hackathons
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!hackathon) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <button
                        onClick={() => navigate("/hackathons/my")}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {hackathon.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Organizer Dashboard & Statistics
                        </p>
                    </div>
                </motion.div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Applications"
                        value={stats.totalApplications || 0}
                        subtitle="All applications received"
                        icon={Users}
                        color="text-blue-600"
                        trend={{ positive: true, value: "+12%" }}
                        loading={false}
                    />
                    <StatsCard
                        title="Confirmed Participants"
                        value={stats.confirmedApplications || 0}
                        subtitle={`${stats.registrationProgress}% of capacity`}
                        icon={UserCheck}
                        color="text-green-600"
                        trend={{ positive: true, value: "+8%" }}
                        loading={false}
                    />
                    <StatsCard
                        title="Pending Reviews"
                        value={stats.pendingApplications || 0}
                        subtitle="Awaiting your decision"
                        icon={Clock}
                        color="text-yellow-600"
                        loading={false}
                    />
                    <StatsCard
                        title="Spots Remaining"
                        value={stats.spotsRemaining || 0}
                        subtitle={`Out of ${hackathon.max_participants || 0} total`}
                        icon={Target}
                        color="text-purple-600"
                        loading={false}
                    />
                </div>

                {/* Charts and Details Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Trend Chart */}
                    <TrendChart applications={applications} />

                    {/* Hackathon Details */}
                    <HackathonDetailsCard hackathon={hackathon} />
                </div>

                {/* Registration Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Registration Progress
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.confirmedApplications} of {hackathon.max_participants} participants
                        </span>
                        <span className="text-sm font-semibold text-indigo-600">
                            {stats.registrationProgress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.registrationProgress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </motion.div>

                {/* Applications Table */}
                <ApplicationsTable
                    applications={applications}
                    loading={false}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
            </div>
        </div>
    );
}
