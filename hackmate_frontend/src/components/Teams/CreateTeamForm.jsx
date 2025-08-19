import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Users, Trophy, MapPin, Plus, Minus, AlertCircle, ChevronRight
} from 'lucide-react';
import hackathonServices from '../../api/hackathonServices';
import teamsServices from '../../api/teamsServices';

const CreateTeamForm = ({ isOpen, onClose, onSuccess }) => {
    const initialForm = {
        name: '',
        description: '',
        hackathon: '',
        max_members: 2,
        required_skills: [],
        looking_for_roles: [],
        project_name: '',
        project_idea: '',
        allow_remote: true
    };

    const [formData, setFormData] = useState(initialForm);
    const [availableHackathons, setAvailableHackathons] = useState([]);
    const [hackathonMap, setHackathonMap] = useState({});
    const [joinedHackathonIds, setJoinedHackathonIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [newRole, setNewRole] = useState('');
    const [step, setStep] = useState(1);

    const commonSkills = [
        'React', 'JavaScript', 'Python', 'Node.js', 'Django', 'Flask',
        'UI/UX Design', 'Figma', 'Machine Learning', 'Data Science'
    ];
    const commonRoles = [
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'UI/UX Designer', 'Product Manager'
    ];

    useEffect(() => {
        if (isOpen) {
            fetchAvailableHackathons();
            fetchJoinedHackathons();
            setFormData(initialForm);
            setStep(1);
            setErrors({});
            setAvailableHackathons([]);
            setHackathonMap({});
        }
    }, [isOpen]);

    const fetchJoinedHackathons = async () => {
        const resp = await teamsServices.getMyTeams();
        if (resp.success) {
            const ids = resp.teams.map(t => t.hackathon);
            // console.log(ids)
            setJoinedHackathonIds([...new Set(ids)]);
        }
        console.log(resp)
    };

    const fetchAvailableHackathons = async () => {
        const response = await hackathonServices.getMyApplications();
        if (response.success) {
            const confirmed = (response.data.applications || [])
                .filter(app =>
                    ['completed', 'not_required'].includes(app.payment_status)
                    && ['team_pending'].includes(app.status)
                )
                .map(app => app.hackathon);

            const hackathonList = [];
            const hackathonMapTmp = {};

            for (let hackathon of confirmed) {
                const { data } = await hackathonServices.getHackathonById(hackathon);
                const obj = data ? data.hackathon : hackathon;
                hackathonList.push(obj);
                hackathonMapTmp[obj.id] = obj;
            }
            // console.log(hackathonList)
            setAvailableHackathons(hackathonList);
            setHackathonMap(hackathonMapTmp);
        }
    };

    // Filter out hackathons where user already has a team
    const selectableHackathons = availableHackathons.filter(h => !joinedHackathonIds.includes(h.id));
    // console.log(availableHackathons)
    // console.log(selectableHackathons)
    const handleChange = (field, value) => {
        if (field === 'hackathon' && value) {
            const h = hackathonMap[value];
            setFormData(prev => ({
                ...prev,
                hackathon: value,
                max_members: h ? h.min_team_size : 2
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const getTeamSizeLimit = () => {
        const sel = hackathonMap[formData.hackathon];
        return {
            min: (sel && sel.min_team_size) || 2,
            max: (sel && sel.max_team_size) || 10
        };
    };
    const { min, max } = getTeamSizeLimit();

    const addSkill = (skill) => {
        if (skill && !formData.required_skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                required_skills: [...prev.required_skills, skill]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => setFormData(prev => ({
        ...prev,
        required_skills: prev.required_skills.filter(s => s !== skill)
    }));

    const addRole = (role) => {
        if (role && !formData.looking_for_roles.includes(role)) {
            setFormData(prev => ({
                ...prev,
                looking_for_roles: [...prev.looking_for_roles, role]
            }));
            setNewRole('');
        }
    };

    const removeRole = (role) => setFormData(prev => ({
        ...prev,
        looking_for_roles: prev.looking_for_roles.filter(r => r !== role)
    }));

    const validateStep = (currentStep) => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = 'Team name is required';
            if (!formData.hackathon) newErrors.hackathon = 'Please select a hackathon';
            if (!formData.description.trim()) newErrors.description = 'Team description is required';
            if (
                parseInt(formData.max_members, 10) < min ||
                parseInt(formData.max_members, 10) > max
            ) {
                newErrors.max_members = `Team size must be between ${min} and ${max}`;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const resetAll = () => {
        setFormData(initialForm);
        setNewSkill('');
        setNewRole('');
        setAvailableHackathons([]);
        setHackathonMap({});
        setErrors({});
        setStep(1);
    };

    const handleClose = () => {
        resetAll();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(step)) return;
        setLoading(true);
        try {
            const response = await teamsServices.createTeam(formData);
            if (response.success) {
                resetAll();
                onSuccess?.(response.team);
                onClose();
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
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={(e) => e.target === e.currentTarget && handleClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Team</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Step {step} of 3</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between px-3">
                            {[1, 2, 3].map((stepNumber) => (
                                <React.Fragment key={stepNumber}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepNumber <= step
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {stepNumber}
                                        </div>
                                    </div>
                                    {stepNumber < 3 && (
                                        <div className={`flex-1 h-1 mx-4 ${stepNumber < step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                                            }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`${step >= 1 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>Basic Info</span>
                            <span className={`${step >= 2 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>Team Details</span>
                            <span className={`${step >= 3 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>Project Info</span>
                        </div>
                    </div>


                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[55vh]">
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Enter your team name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Hackathon *
                                    </label>
                                    <select
                                        value={formData.hackathon}
                                        onChange={(e) => handleChange('hackathon', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.hackathon ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        <option value="">Select a hackathon</option>
                                        {selectableHackathons.map((h) => (
                                            <option key={h.id} value={h.id}>
                                                {h.title} ({new Date(h.start_date).toLocaleDateString()})
                                                [min: {h.min_team_size}/max: {h.max_team_size}]
                                            </option>
                                        ))}
                                    </select>
                                    {selectableHackathons.length === 0 && (
                                        <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                                            You already have teams for all your hackathons.
                                        </p>
                                    )}
                                    {errors.hackathon && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.hackathon}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Team Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={3}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Describe your team, goals, and what you're looking for..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Max Members
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleChange('max_members', Math.max(min, +formData.max_members - 1))}
                                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium dark:text-white">
                                            {formData.max_members}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('max_members', Math.min(max, +formData.max_members + 1))}
                                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Allowed size: {min}–{max}
                                    </div>
                                    {errors.max_members && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.max_members}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3 mt-2">
                                    <input
                                        type="checkbox"
                                        id="allow_remote"
                                        checked={formData.allow_remote}
                                        onChange={(e) => handleChange('allow_remote', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="allow_remote" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Allow remote collaboration
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Team Requirements */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                {/* Skills */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Required Skills
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add a skill..."
                                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addSkill(newSkill)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                        Popular:{" "}
                                        {commonSkills.filter(skill => !formData.required_skills.includes(skill)).slice(0, 6).map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => addSkill(skill)}
                                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full mx-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                +{skill}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.required_skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.required_skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(skill)}
                                                        className="hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Roles */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Looking for Roles
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            placeholder="Add a role..."
                                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
                                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                        Popular:{" "}
                                        {commonRoles.filter(role => !formData.looking_for_roles.includes(role)).slice(0, 6).map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => addRole(role)}
                                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full mx-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                +{role}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.looking_for_roles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.looking_for_roles.map(role => (
                                                <span
                                                    key={role}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                                                >
                                                    {role}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRole(role)}
                                                        className="hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Project Information */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.project_name}
                                        onChange={(e) => handleChange('project_name', e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        placeholder="What will you build?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project Idea (Optional)
                                    </label>
                                    <textarea
                                        value={formData.project_idea}
                                        onChange={(e) => handleChange('project_idea', e.target.value)}
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        placeholder="Describe your project idea, goals, and vision..."
                                    />
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Team Summary</h3>
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p><span className="font-medium">Name:</span> {formData.name}</p>
                                        <p><span className="font-medium">Max Members:</span> {formData.max_members}</p>
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
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={selectableHackathons.length === 0}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading || selectableHackathons.length === 0}
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
