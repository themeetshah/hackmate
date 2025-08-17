import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Users, Trophy, Lock, Globe, MapPin, Clock,
    MessageCircle, Code, Lightbulb, Plus, Minus, AlertCircle
} from 'lucide-react';
import teamsServices from '../../api/teamsServices';

const CreateTeamForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        hackathon: '',
        max_members: 4,
        privacy: 'public',
        required_skills: [],
        looking_for_roles: [],
        project_name: '',
        project_idea: '',
        allow_remote: true,
        preferred_timezone: '',
        communication_platform: ''
    });

    const [availableHackathons, setAvailableHackathons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [newRole, setNewRole] = useState('');
    const [step, setStep] = useState(1);

    // Common skills and roles for suggestions
    const commonSkills = [
        'React', 'JavaScript', 'Python', 'Node.js', 'Django', 'Flask',
        'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop',
        'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch',
        'Mobile Development', 'React Native', 'Flutter', 'Swift',
        'DevOps', 'Docker', 'AWS', 'Azure', 'MongoDB', 'PostgreSQL'
    ];

    const commonRoles = [
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'UI/UX Designer', 'Product Manager', 'Data Scientist',
        'Mobile Developer', 'DevOps Engineer', 'Marketing Specialist',
        'Business Analyst', 'QA Engineer', 'Project Manager'
    ];

    const privacyOptions = [
        { value: 'public', label: 'Public', description: 'Anyone can see and join your team', icon: Globe },
        { value: 'private', label: 'Private', description: 'Only invited members can join', icon: Lock },
        { value: 'invite_only', label: 'Invite Only', description: 'Only you can invite members', icon: Users }
    ];

    useEffect(() => {
        if (isOpen) {
            fetchAvailableHackathons();
        }
    }, [isOpen]);

    const fetchAvailableHackathons = async () => {
        const response = await teamsServices.getAvailableHackathons();
        if (response.success) {
            setAvailableHackathons(response.hackathons);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const addSkill = (skill) => {
        if (skill && !formData.required_skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                required_skills: [...prev.required_skills, skill]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            required_skills: prev.required_skills.filter(s => s !== skill)
        }));
    };

    const addRole = (role) => {
        if (role && !formData.looking_for_roles.includes(role)) {
            setFormData(prev => ({
                ...prev,
                looking_for_roles: [...prev.looking_for_roles, role]
            }));
            setNewRole('');
        }
    };

    const removeRole = (role) => {
        setFormData(prev => ({
            ...prev,
            looking_for_roles: prev.looking_for_roles.filter(r => r !== role)
        }));
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = 'Team name is required';
            if (!formData.hackathon) newErrors.hackathon = 'Please select a hackathon';
            if (!formData.description.trim()) newErrors.description = 'Team description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(step)) return;

        setLoading(true);

        try {
            const response = await teamsServices.createTeam(formData);

            if (response.success) {
                onSuccess?.(response.team);
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    hackathon: '',
                    max_members: 4,
                    privacy: 'public',
                    required_skills: [],
                    looking_for_roles: [],
                    project_name: '',
                    project_idea: '',
                    allow_remote: true,
                    preferred_timezone: '',
                    communication_platform: ''
                });
                setStep(1);
                setErrors({});
            } else {
                setErrors(response.errors || { general: response.message });
            }
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Create Team</h2>
                                <p className="text-indigo-100 text-sm">Step {step} of 3</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-2 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((stepNumber) => (
                                <div key={stepNumber} className="flex-1">
                                    <div className={`h-2 rounded-full transition-colors ${stepNumber <= step
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                            : 'bg-gray-200 dark:bg-gray-600'
                                        }`} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className={step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>Basic Info</span>
                            <span className={step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>Team Details</span>
                            <span className={step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>Project Info</span>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Team Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your team name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Hackathon Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hackathon *
                                    </label>
                                    <select
                                        value={formData.hackathon}
                                        onChange={(e) => handleChange('hackathon', e.target.value)}
                                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.hackathon ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select a hackathon</option>
                                        {availableHackathons.map((hackathon) => (
                                            <option key={hackathon.id} value={hackathon.id}>
                                                {hackathon.title} ({new Date(hackathon.start_date).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.hackathon && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.hackathon}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Team Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={4}
                                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Describe your team, goals, and what you're looking for..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Team Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Members
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleChange('max_members', Math.max(2, formData.max_members - 1))}
                                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium">
                                                {formData.max_members}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleChange('max_members', Math.min(10, formData.max_members + 1))}
                                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Privacy
                                        </label>
                                        <select
                                            value={formData.privacy}
                                            onChange={(e) => handleChange('privacy', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            {privacyOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Team Requirements */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Required Skills */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Required Skills
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add a skill..."
                                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addSkill(newSkill)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Common Skills Suggestions */}
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular skills:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {commonSkills.filter(skill => !formData.required_skills.includes(skill)).slice(0, 8).map((skill) => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => addSkill(skill)}
                                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                                >
                                                    + {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected Skills */}
                                    {formData.required_skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.required_skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(skill)}
                                                        className="hover:text-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Looking for Roles */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Looking for Roles
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            placeholder="Add a role..."
                                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole(newRole))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addRole(newRole)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Common Roles Suggestions */}
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular roles:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {commonRoles.filter(role => !formData.looking_for_roles.includes(role)).slice(0, 6).map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => addRole(role)}
                                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                                >
                                                    + {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected Roles */}
                                    {formData.looking_for_roles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.looking_for_roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                                                >
                                                    {role}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRole(role)}
                                                        className="hover:text-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Team Preferences */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Preferred Timezone
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.preferred_timezone}
                                            onChange={(e) => handleChange('preferred_timezone', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="e.g., UTC+5:30, EST, PST"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Communication Platform
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.communication_platform}
                                            onChange={(e) => handleChange('communication_platform', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="e.g., Slack, Discord, Teams"
                                        />
                                    </div>
                                </div>

                                {/* Remote Work */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="allow_remote"
                                        checked={formData.allow_remote}
                                        onChange={(e) => handleChange('allow_remote', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                                    />
                                    <label htmlFor="allow_remote" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Allow remote collaboration
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Project Information */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Project Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.project_name}
                                        onChange={(e) => handleChange('project_name', e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="What will you build?"
                                    />
                                </div>

                                {/* Project Idea */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Idea (Optional)
                                    </label>
                                    <textarea
                                        value={formData.project_idea}
                                        onChange={(e) => handleChange('project_idea', e.target.value)}
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Describe your project idea, goals, and vision..."
                                    />
                                </div>

                                {/* Summary */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Team Summary</h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <p><span className="font-medium">Name:</span> {formData.name}</p>
                                        <p><span className="font-medium">Max Members:</span> {formData.max_members}</p>
                                        <p><span className="font-medium">Privacy:</span> {formData.privacy}</p>
                                        {formData.required_skills.length > 0 && (
                                            <p><span className="font-medium">Skills:</span> {formData.required_skills.join(', ')}</p>
                                        )}
                                        {formData.looking_for_roles.length > 0 && (
                                            <p><span className="font-medium">Looking for:</span> {formData.looking_for_roles.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* General Error */}
                        {errors.general && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.general}
                                </p>
                            </div>
                        )}
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                        <div className="flex gap-2">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Previous
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="w-4 h-4" />
                                            Create Team
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateTeamForm;
