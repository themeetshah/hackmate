import React from 'react';
import { motion } from 'framer-motion';
import {
    Home, ArrowLeft, Search, Compass, Zap,
    Code, Trophy, Users, Heart, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const floatingAnimation = {
        y: [0, -20, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    const quickLinks = [
        {
            title: "Home",
            description: "Back to dashboard",
            to: "/",
            icon: Home,
            color: "from-blue-500 to-indigo-600"
        },
        {
            title: "Hackathons",
            description: "Browse competitions",
            to: "/hackathons",
            icon: Trophy,
            color: "from-purple-500 to-pink-600"
        },
        {
            title: "Find Teams",
            description: "Connect with others",
            to: "/matching",
            icon: Users,
            color: "from-emerald-500 to-teal-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">

                {/* Animated 404 Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    {/* Large 404 with floating elements */}
                    <div className="relative mb-8">
                        <motion.div
                            animate={floatingAnimation}
                            className="text-8xl md:text-9xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                        >
                            404
                        </motion.div>

                        {/* Floating decorative elements */}
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-60"
                        />
                        <motion.div
                            animate={{ rotate: -360, y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 -left-8 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-40"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute -bottom-2 right-1/4 w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-50"
                        />
                    </div>

                    {/* Error Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Oops! Page Not Found
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                            Looks like this page went on a coding adventure and got lost!
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-500 mb-8">
                            Don't worry, even the best developers encounter 404s. Let's get you back on track.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-3 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-400 dark:hover:text-gray-900 transition-all duration-300"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </motion.div>

                {/* Quick Navigation Links */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2">
                        <Compass className="w-6 h-6 text-indigo-600" />
                        Quick Navigation
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickLinks.map((link, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <Link
                                    to={link.to}
                                    className="block bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                        <link.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {link.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {link.description}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Fun Developer Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <span>💡 Developer Tip</span>
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                404 errors are like bugs in code - they happen to everyone! The important thing is how you handle them.
                                This page you're looking for might be under development, moved, or maybe it was just a typo in the URL.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm font-medium">Keep coding, keep learning!</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Made with love for the developer community
                        <Sparkles className="w-4 h-4" />
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
