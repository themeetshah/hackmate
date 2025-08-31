import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Eye, Calendar, MapPin, Users, Trophy,
    Globe, Monitor, MapIcon, Upload, X, Plus, Tag, Clock,
    DollarSign, Star, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';

const HackathonCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [previewMode, setPreviewMode] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        // Basic Information
        title: '',
        short_description: '',
        banner_image: null,

        // Categories and Tags
        categories: [],
        tech_stack: [],
        themes: [],

        // Timing
        start_date: '',
        end_date: '',
        registration_start: '',
        registration_end: '',

        // Registration Settings
        registration_type: 'both',
        max_participants: 100,
        min_team_size: 1,
        max_team_size: 4,

        // Event Details
        mode: 'online',
        venue: '',
        meeting_link: '',
        difficulty_level: 'intermediate',

        // Prizes and Rewards
        prizes: { first: 0, second: 0, third: 0 },
        total_prize_pool: 0,

        // Settings
        is_featured: false,
        is_free: true,
        registration_fee: 0,
        status: 'published'
    });

    // Input field states for dynamic arrays
    const [categoryInput, setCategoryInput] = useState('');
    const [techInput, setTechInput] = useState('');
    const [themeInput, setThemeInput] = useState('');

    // Predefined options
    const difficultyOptions = [
        { value: 'beginner', label: 'Beginner', description: 'New to hackathons' },
        { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
        { value: 'advanced', label: 'Advanced', description: 'Experienced developers' },
        { value: 'expert', label: 'Expert', description: 'Professional level' }
    ];

    const modeOptions = [
        { value: 'online', label: 'Online', icon: Globe, description: 'Virtual event' },
        { value: 'offline', label: 'In-Person', icon: MapIcon, description: 'Physical venue' },
        { value: 'hybrid', label: 'Hybrid', icon: Monitor, description: 'Online + Offline' }
    ];

    const registrationTypeOptions = [
        { value: 'individual', label: 'Individual Only', description: 'Solo participants' },
        { value: 'team', label: 'Team Only', description: 'Team-based only' },
        { value: 'both', label: 'Individual & Team', description: 'Both allowed' }
    ];

    // Handle input changes
    const handleInputChange = (field, value) => {
        console.log('===================')
        console.log(field, ': ', value)
        console.log('===================')
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle file upload
    const handleFileUpload = (file) => {
        if (file) {
            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, banner_image: 'Please upload an image file' }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setErrors(prev => ({ ...prev, banner_image: 'Image size must be less than 5MB' }));
                return;
            }

            setFormData(prev => ({ ...prev, banner_image: file }));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.banner_image;
                return newErrors;
            });
        }
    };

    // Handle dynamic array additions
    const addToArray = (arrayName, inputValue, setInputValue) => {
        if (inputValue.trim() && !formData[arrayName].includes(inputValue.trim())) {
            setFormData(prev => ({
                ...prev,
                [arrayName]: [...prev[arrayName], inputValue.trim()]
            }));
            setInputValue('');
        }
    };

    const removeFromArray = (arrayName, item) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter(i => i !== item)
        }));
    };

    // Form validation
    // Add this validation function to HackathonCreate.jsx
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.short_description.trim()) newErrors.short_description = 'Description is required';
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (!formData.end_date) newErrors.end_date = 'End date is required';
        if (!formData.registration_start) newErrors.registration_start = 'Registration start is required';
        if (!formData.registration_end) newErrors.registration_end = 'Registration end is required';

        // Date validations
        const now = new Date();
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        const regStart = new Date(formData.registration_start);
        const regEnd = new Date(formData.registration_end);

        if (regStart < now) newErrors.registration_start = 'Registration start must be in the future';
        if (regEnd <= regStart) newErrors.registration_end = 'Registration end must be after start';
        if (startDate <= regEnd) newErrors.start_date = 'Event start must be after registration ends';
        if (endDate <= startDate) newErrors.end_date = 'Event end must be after start';

        // Participant validations
        if (formData.max_participants < 1) newErrors.max_participants = 'Must allow at least 1 participant';
        if (formData.min_team_size < 1) newErrors.min_team_size = 'Minimum team size must be at least 1';
        if (formData.max_team_size < formData.min_team_size) {
            newErrors.max_team_size = 'Maximum team size must be >= minimum';
        }

        // ✅ NEW: Advanced participant and team size constraints
        if (formData.registration_type === 'team') {
            // For team-only hackathons
            const maxPossibleTeams = Math.floor(formData.max_participants / formData.min_team_size);
            const minRequiredParticipants = formData.min_team_size;

            if (formData.max_participants < minRequiredParticipants) {
                newErrors.max_participants = `For team-only events, max participants must be at least ${minRequiredParticipants} (min team size)`;
            }

            if (maxPossibleTeams < 1) {
                newErrors.max_participants = `With current team size constraints, at least ${formData.min_team_size} participants are needed`;
            }
        } else if (formData.registration_type === 'both') {
            // For mixed registration
            const minRequiredForOneTeam = formData.min_team_size;
            if (formData.max_participants < minRequiredForOneTeam) {
                newErrors.max_participants = `To allow team registration, max participants must be at least ${minRequiredForOneTeam}`;
            }
        }

        // Team size logical constraints
        if (formData.registration_type !== 'individual') {
            if (formData.min_team_size > formData.max_participants) {
                newErrors.min_team_size = 'Minimum team size cannot exceed maximum participants';
            }
            if (formData.max_team_size > formData.max_participants) {
                newErrors.max_team_size = 'Maximum team size cannot exceed maximum participants';
            }

            // Check if team formation is mathematically possible
            const remainingSlots = formData.max_participants % formData.min_team_size;
            if (remainingSlots > 0 && remainingSlots < formData.min_team_size && formData.registration_type === 'team') {
                newErrors.max_participants = `With min team size of ${formData.min_team_size}, participants should be a multiple of team size or allow individual registration`;
            }
        }

        // Mode-specific validations
        if (formData.mode !== 'online' && !formData.venue.trim()) {
            newErrors.venue = 'Venue is required for offline/hybrid events';
        }
        if (formData.mode !== 'offline' && !formData.meeting_link.trim()) {
            newErrors.meeting_link = 'Meeting link is required for online/hybrid events';
        }

        // Prize validations
        if (!formData.is_free && formData.registration_fee <= 0) {
            newErrors.registration_fee = 'Registration fee must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    // Submit form
    const handleSubmit = async (publishImmediately = false) => {
        if (!validateForm()) {
            console.log(errors)
            alert('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            console.log('Original form data:', formData)

            // Prepare form data for API
            const submitData = {
                ...formData,
                status: publishImmediately ? 'published' : 'draft',
                organizer: user.id,
                // Convert prizes object to expected format
                prizes: {
                    first: formData.prizes.first || 0,
                    second: formData.prizes.second || 0,
                    third: formData.prizes.third || 0
                },
                total_prize_pool: formData.prizes.first + formData.prizes.second + formData.prizes.third
            };

            // Create FormData for file upload
            const apiFormData = new FormData();

            // Add all form fields with proper handling
            Object.keys(submitData).forEach(key => {
                const value = submitData[key];

                if (key === 'banner_image') {
                    // Only append if there's actually a file
                    if (value && value instanceof File) {
                        apiFormData.append(key, value);
                        console.log('Added banner_image file:', value.name);
                    }
                    // If no file, don't append anything (not an empty object)
                } else if (Array.isArray(value)) {
                    // Convert arrays to JSON strings
                    apiFormData.append(key, JSON.stringify(value));
                } else if (typeof value === 'object' && value !== null) {
                    // Convert objects to JSON strings
                    apiFormData.append(key, JSON.stringify(value));
                } else if (typeof value === 'boolean') {
                    // Convert boolean to string
                    apiFormData.append(key, value ? 'true' : 'false');
                } else if (typeof value === 'number') {
                    // Convert number to string
                    apiFormData.append(key, value.toString());
                } else {
                    // Add as string
                    apiFormData.append(key, String(value || ''));
                }
            });

            // Debug: Log FormData contents
            console.log('FormData contents:');
            for (let [key, value] of apiFormData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            // Submit to backend
            console.log(apiFormData)
            const response = await hackathonServices.createHackathon(apiFormData);

            if (response.success) {
                alert(`Hackathon ${publishImmediately ? 'created and published' : 'saved as draft'} successfully!`);
                navigate('/hackathons');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to create hackathon:', error);

            let errorMessage = 'Failed to create hackathon';

            // Handle different error types
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                errorMessage = 'Please fix the validation errors';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Check if user can create hackathons
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Authentication Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You need to be logged in to create a hackathon.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You need organizer permissions to create hackathons.
                    </p>
                    <button
                        onClick={() => navigate('/hackathons')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Back to Hackathons
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/hackathons')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Create Hackathon
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Organize an amazing coding competition
                            </p>
                        </div>
                    </div>

                    {/* <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                    </div> */}
                </div>

                {/* Main Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

                    {/* Step 1: Basic Information */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">1</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Basic Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hackathon Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., AI Innovation Challenge 2025"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.title
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            } text-gray-900 dark:text-white`}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Short Description *
                                    </label>
                                    <textarea
                                        value={formData.short_description}
                                        onChange={(e) => handleInputChange('short_description', e.target.value)}
                                        placeholder="Brief description of your hackathon (max 500 characters)"
                                        maxLength={500}
                                        rows={4}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${errors.short_description
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            } text-gray-900 dark:text-white`}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        {errors.short_description ? (
                                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.short_description}
                                            </p>
                                        ) : (
                                            <div></div>
                                        )}
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formData.short_description.length}/500
                                        </span>
                                    </div>
                                </div>

                                {/* Difficulty Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {difficultyOptions.map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleInputChange('difficulty_level', option.value)}
                                                className={`p-4 border-2 rounded-xl text-left transition-all ${formData.difficulty_level === option.value
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                            >
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {option.label}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {option.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Banner Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Banner Image
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                                        {formData.banner_image ? (
                                            <div className="space-y-4">
                                                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                    <img
                                                        src={URL.createObjectURL(formData.banner_image)}
                                                        alt="Banner preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => handleInputChange('banner_image', null)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formData.banner_image.name}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                    Upload a banner image for your hackathon
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e.target.files[0])}
                                                    className="hidden"
                                                    id="banner-upload"
                                                />
                                                <label
                                                    htmlFor="banner-upload"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Choose File
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    {errors.banner_image && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.banner_image}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Recommended: 1200x400px, max 5MB
                                    </p>
                                </div>

                                {/* Event Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Event Mode
                                    </label>
                                    <div className="space-y-3">
                                        {modeOptions.map(option => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => handleInputChange('mode', option.value)}
                                                    className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3 ${formData.mode === option.value
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                        }`}
                                                >
                                                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {option.label}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {option.description}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Categories and Technologies */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">2</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Categories & Technologies
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Categories */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Categories
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={categoryInput}
                                            onChange={(e) => setCategoryInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('categories', categoryInput, setCategoryInput))}
                                            placeholder="e.g., AI/ML, Web Dev"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addToArray('categories', categoryInput, setCategoryInput)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {formData.categories.map((category, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                                            >
                                                {category}
                                                <button
                                                    onClick={() => removeFromArray('categories', category)}
                                                    className="hover:text-indigo-600 dark:hover:text-indigo-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Tech Stack
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={techInput}
                                            onChange={(e) => setTechInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tech_stack', techInput, setTechInput))}
                                            placeholder="e.g., React, Python"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addToArray('tech_stack', techInput, setTechInput)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {formData.tech_stack.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                                            >
                                                {tech}
                                                <button
                                                    onClick={() => removeFromArray('tech_stack', tech)}
                                                    className="hover:text-purple-600 dark:hover:text-purple-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Themes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Themes
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={themeInput}
                                            onChange={(e) => setThemeInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('themes', themeInput, setThemeInput))}
                                            placeholder="e.g., Healthcare, Education"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addToArray('themes', themeInput, setThemeInput)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {formData.themes.map((theme, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm"
                                            >
                                                {theme}
                                                <button
                                                    onClick={() => removeFromArray('themes', theme)}
                                                    className="hover:text-green-600 dark:hover:text-green-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Schedule & Timing */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">3</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Schedule & Timing
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Registration Period */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Registration Period
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Registration Start *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.registration_start}
                                            onChange={(e) => handleInputChange('registration_start', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.registration_start
                                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                } text-gray-900 dark:text-white`}
                                        />
                                        {errors.registration_start && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.registration_start}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Registration End *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.registration_end}
                                            onChange={(e) => handleInputChange('registration_end', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.registration_end
                                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                } text-gray-900 dark:text-white`}
                                        />
                                        {errors.registration_end && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.registration_end}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Event Period */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Event Period
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Event Start *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start_date}
                                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.start_date
                                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                } text-gray-900 dark:text-white`}
                                        />
                                        {errors.start_date && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Event End *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.end_date}
                                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.end_date
                                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                } text-gray-900 dark:text-white`}
                                        />
                                        {errors.end_date && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.end_date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Registration Settings */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">4</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Registration Settings
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Registration Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                    Registration Type
                                </label>
                                <div className="space-y-3">
                                    {registrationTypeOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleInputChange('registration_type', option.value)}
                                            className={`w-full p-4 border-2 rounded-xl text-left transition-all ${formData.registration_type === option.value
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {option.label}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {option.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Participant Settings */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Maximum Participants *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_participants}
                                        onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 0)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.max_participants
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            } text-gray-900 dark:text-white`}
                                    />
                                    {errors.max_participants && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.max_participants}
                                        </p>
                                    )}
                                </div>

                                {formData.registration_type !== 'individual' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Min Team Size
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.min_team_size}
                                                onChange={(e) => handleInputChange('min_team_size', parseInt(e.target.value) || 1)}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.min_team_size
                                                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                    } text-gray-900 dark:text-white`}
                                            />
                                            {errors.min_team_size && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.min_team_size}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Max Team Size
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.max_team_size}
                                                onChange={(e) => handleInputChange('max_team_size', parseInt(e.target.value) || 1)}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.max_team_size
                                                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                    } text-gray-900 dark:text-white`}
                                            />
                                            {errors.max_team_size && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.max_team_size}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 5: Event Details */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">5</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Event Details
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Venue (for offline/hybrid) */}
                            {formData.mode !== 'online' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Venue Details *
                                    </label>
                                    <textarea
                                        value={formData.venue}
                                        onChange={(e) => handleInputChange('venue', e.target.value)}
                                        placeholder="Enter venue address and details"
                                        rows={3}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${errors.venue
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            } text-gray-900 dark:text-white`}
                                    />
                                    {errors.venue && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.venue}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Meeting Link (for online/hybrid) */}
                            {formData.mode !== 'offline' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meeting Link *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.meeting_link}
                                        onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.meeting_link
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            } text-gray-900 dark:text-white`}
                                    />
                                    {errors.meeting_link && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.meeting_link}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 6: Prizes & Registration Fee */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">6</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Prizes & Registration
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Prizes */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Prize Distribution
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            First Prize
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={parseFloat(formData.prizes.first)}
                                            onChange={(e) => handleInputChange('prizes', { ...formData.prizes, first: parseFloat(e.target.value) })}
                                            placeholder="e.g., 50000"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Second Prize
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={parseFloat(formData.prizes.second)}
                                            onChange={(e) => handleInputChange('prizes', { ...formData.prizes, second: parseFloat(e.target.value) })}
                                            placeholder="e.g., 30000"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Third Prize
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={parseFloat(formData.prizes.third)}
                                            onChange={(e) => handleInputChange('prizes', { ...formData.prizes, third: parseFloat(e.target.value) })}
                                            placeholder="e.g., 10000"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Total Prize Pool
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={parseFloat(formData.prizes.first) + parseFloat(formData.prizes.second) + parseFloat(formData.prizes.third)}
                                            onChange={(e) => handleInputChange('total_prize_pool', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., 90000"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Registration Fee */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Registration Settings
                                </h3>
                                <div className="space-y-4">
                                    {/* Free/Paid Toggle */}
                                    <div>
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_free}
                                                onChange={(e) => handleInputChange('is_free', e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    Free Event
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    No registration fee required
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Registration Fee */}
                                    {!formData.is_free && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Registration Fee (₹) *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={formData.registration_fee}
                                                onChange={(e) => handleInputChange('registration_fee', parseFloat(e.target.value) || 0)}
                                                placeholder="299"
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.registration_fee
                                                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                    } text-gray-900 dark:text-white`}
                                            />
                                            {errors.registration_fee && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.registration_fee}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Featured Event */}
                                    <div>
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_featured}
                                                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    Featured Event
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Highlight this hackathon on the main page
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-8">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate('/hackathons')}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-4">
                                {/* <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 border border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Saving...' : 'Save as Draft'}
                                </button> */}

                                <button
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {loading ? 'Publishing...' : 'Create & Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonCreate;
