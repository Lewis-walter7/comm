'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

type TabType = 'profile' | 'account' | 'appearance' | 'notifications';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const {
        themeMode,
        setThemeMode,
        accentColor,
        setAccentColor,
        fontSize,
        setFontSize,
        interfaceDensity,
        setInterfaceDensity,
        animationsEnabled,
        setAnimationsEnabled
    } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        location: user?.location || '',
    });

    useEffect(() => {
        setProfileForm({
            name: user?.name || '',
            email: user?.email || '',
            bio: user?.bio || '',
            phone: user?.phone || '',
            location: user?.location || '',
        });
    }, [user]);

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
        { id: 'account' as TabType, label: 'Account', icon: '⚙️' },
        { id: 'appearance' as TabType, label: 'Appearance', icon: '🎨' },
        { id: 'notifications' as TabType, label: 'Notifications', icon: '🔔' },
    ];

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            const response = await api.patch('/users/me', profileForm);
            updateUser(response.data);
            setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            setSaveMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    // Account deletion state and handlers
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');

    const handleScheduleDeletion = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            const response = await api.post('/users/me/schedule-deletion', { reason: deleteReason });
            updateUser(response.data);
            setShowDeleteModal(false);
            setDeleteReason('');
            setSaveMessage({ type: 'success', text: 'Account deletion scheduled. You have 30 days to cancel.' });
            setTimeout(() => setSaveMessage(null), 5000);
        } catch (error: any) {
            console.error('Error scheduling deletion:', error);
            setSaveMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to schedule deletion. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelDeletion = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            const response = await api.post('/users/me/cancel-deletion');
            updateUser(response.data);
            setSaveMessage({ type: 'success', text: 'Account deletion cancelled successfully!' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error: any) {
            console.error('Error cancelling deletion:', error);
            setSaveMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to cancel deletion. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <nav className="space-y-2 sticky top-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${activeTab === tab.id
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Profile Settings */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>

                                        {/* Avatar Section */}
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <button className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors">
                                                    Change Avatar
                                                </button>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Bio
                                                </label>
                                                <textarea
                                                    value={profileForm.bio}
                                                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                                    rows={4}
                                                    placeholder="Tell us about yourself..."
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.location}
                                                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                                    placeholder="San Francisco, CA"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {saveMessage && (
                                            <div className={`mt-4 p-4 rounded-xl ${saveMessage.type === 'success'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                }`}>
                                                {saveMessage.text}
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className={`px-6 py-2.5 cursor-pointer rounded-xl bg-primary-500 text-white font-medium transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-600'
                                                    }`}
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => setProfileForm({
                                                    name: user?.name || '',
                                                    email: user?.email || '',
                                                    bio: user?.bio || '',
                                                    phone: user?.phone || '',
                                                    location: user?.location || '',
                                                })}
                                                className="px-6 py-2.5 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Settings */}
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>

                                        <div className="space-y-6">
                                            {/* Language */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Language
                                                </label>
                                                <select className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                                                    <option>English (US)</option>
                                                    <option>Spanish</option>
                                                    <option>French</option>
                                                    <option>German</option>
                                                </select>
                                            </div>

                                            {/* Timezone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Timezone
                                                </label>
                                                <select className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                                                    <option>UTC-8 (Pacific Time)</option>
                                                    <option>UTC-5 (Eastern Time)</option>
                                                    <option>UTC+0 (GMT)</option>
                                                    <option>UTC+3 (East Africa Time)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="p-8 rounded-3xl bg-red-50/60 dark:bg-red-900/10 backdrop-blur-lg border border-red-200/50 dark:border-red-500/20 shadow-lg">
                                        <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-4">Danger Zone</h2>

                                        {user?.scheduledDeletionAt ? (
                                            // Account deletion is scheduled
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/20">
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                                                                Account Deletion Scheduled
                                                            </h3>
                                                            <p className="text-sm text-orange-700 dark:text-orange-400">
                                                                Your account and all associated data will be permanently deleted on{' '}
                                                                <strong>{new Date(user.scheduledDeletionAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}</strong>
                                                                {' '}({Math.ceil((new Date(user.scheduledDeletionAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleCancelDeletion}
                                                    disabled={saving}
                                                    className="w-full px-6 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {saving ? 'Cancelling...' : 'Cancel Account Deletion'}
                                                </button>
                                            </div>
                                        ) : (
                                            // Account deletion not scheduled
                                            <>
                                                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                                    Once you delete your account, there is no going back. Your account will be scheduled for deletion and permanently removed after 30 days.
                                                </p>
                                                <button
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    Delete Account
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}



                            {/* Appearance Settings */}
                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Appearance</h2>

                                        {/* Theme Mode Selection */}
                                        <div className="space-y-4 mb-8">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                Theme Mode
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { id: 'light' as const, icon: '☀️', label: 'Light', desc: 'Clean and bright' },
                                                    { id: 'dark' as const, icon: '🌙', label: 'Dark', desc: 'Easy on the eyes' },
                                                    { id: 'system' as const, icon: '💻', label: 'System', desc: 'Match OS theme' },
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => setThemeMode(mode.id)}
                                                        className={`p-4 rounded-xl border-2 transition-all text-left ${themeMode === mode.id
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-3xl">{mode.icon}</div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{mode.label}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{mode.desc}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Accent Color */}
                                        <div className="mb-8">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                Accent Color
                                            </label>
                                            <div className="flex gap-3">
                                                {[
                                                    { color: 'blue' as const, bg: 'bg-blue-500' },
                                                    { color: 'purple' as const, bg: 'bg-purple-500' },
                                                    { color: 'pink' as const, bg: 'bg-pink-500' },
                                                    { color: 'green' as const, bg: 'bg-green-500' },
                                                    { color: 'orange' as const, bg: 'bg-orange-500' },
                                                ].map((item) => (
                                                    <button
                                                        key={item.color}
                                                        onClick={() => setAccentColor(item.color)}
                                                        className={`w-14 h-14 rounded-xl ${item.bg} hover:scale-110 transition-transform shadow-lg relative flex items-center justify-center`}
                                                    >
                                                        {accentColor === item.color && (
                                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Font Size */}
                                        <div className="mb-8">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                Font Size
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { size: 'small' as const, label: 'Small', example: 'text-sm' },
                                                    { size: 'medium' as const, label: 'Medium', example: 'text-base' },
                                                    { size: 'large' as const, label: 'Large', example: 'text-lg' },
                                                ].map((item) => (
                                                    <button
                                                        key={item.size}
                                                        onClick={() => setFontSize(item.size)}
                                                        className={`p-3 rounded-xl border-2 transition-all ${fontSize === item.size
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <p className={`font-medium text-gray-900 dark:text-white ${item.example}`}>
                                                            {item.label}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Interface Density */}
                                        <div className="mb-8">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                Interface Density
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { density: 'compact' as const, label: 'Compact', desc: 'More content' },
                                                    { density: 'comfortable' as const, label: 'Comfortable', desc: 'Balanced' },
                                                    { density: 'spacious' as const, label: 'Spacious', desc: 'More space' },
                                                ].map((item) => (
                                                    <button
                                                        key={item.density}
                                                        onClick={() => setInterfaceDensity(item.density)}
                                                        className={`p-3 rounded-xl border-2 transition-all text-left ${interfaceDensity === item.density
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Animations */}
                                        <div>
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Enable Animations</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Smooth transitions and effects
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={animationsEnabled}
                                                        onChange={(e) => setAnimationsEnabled(e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Settings */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>

                                        <div className="space-y-6">
                                            {/* Email Notifications */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Notifications</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Project Updates', description: 'Get notified when someone updates a project' },
                                                        { label: 'Comments', description: 'Get notified when someone comments on your documents' },
                                                        { label: 'Mentions', description: 'Get notified when someone mentions you' },
                                                        { label: 'Weekly Summary', description: 'Receive a weekly summary of your activity' },
                                                    ].map((item) => (
                                                        <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Push Notifications */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Push Notifications</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Real-time Collaboration', description: 'Get notified when someone is editing with you' },
                                                        { label: 'Security Alerts', description: 'Important security updates and alerts' },
                                                    ].map((item) => (
                                                        <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-red-200 dark:border-red-500/20"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Delete Account?
                                    </h2>
                                </div>
                            </div>

                            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    <strong>Warning:</strong> Your account will be scheduled for deletion. You'll have <strong>30 days</strong> to cancel before it's permanently removed along with all your data, including:
                                </p>
                                <ul className="mt-2 ml-4 text-sm text-red-700 dark:text-red-400 list-disc space-y-1">
                                    <li>All projects and documents</li>
                                    <li>Chat messages and activities</li>
                                    <li>Personal settings and preferences</li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for leaving (optional)
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    rows={3}
                                    placeholder="Help us improve by sharing why you're leaving..."
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                />
                            </div>

                            {saveMessage && (
                                <div className={`mb-4 p-4 rounded-xl ${saveMessage.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    }`}>
                                    {saveMessage.text}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={saving}
                                    className="flex-1 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleDeletion}
                                    disabled={saving}
                                    className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Scheduling...' : 'Delete Account'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div >
    );
}
