import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Palette, Shield } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useAuthStore, useThemeStore, useSettingsStore } from '../context/store';
import { useNotification } from '../hooks/useNotification';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { settings, setProfileSettings, setNotificationSettings, setPrivacySettings } = useSettingsStore();
  const { success } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: settings.profile.bio || '',
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      bio: settings.profile.bio || '',
    });
  }, [user, settings.profile.bio]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    setUser({ ...user, name: profileForm.name, email: profileForm.email });
    setProfileSettings({ ...settings.profile, bio: profileForm.bio });
    success('Profile settings saved');
    navigate('/boards');
  };

  const handleToggleNotification = (key) => {
    setNotificationSettings({
      ...settings.notifications,
      [key]: !settings.notifications[key],
    });
  };

  const handleTogglePrivacy = (key) => {
    setPrivacySettings({
      ...settings.privacy,
      [key]: !settings.privacy[key],
    });
  };

  const handleThemeChange = (value) => {
    setTheme(value);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="border-b border-gray-200 dark:border-slate-700 lg:border-r lg:border-b-0 bg-gray-50 dark:bg-slate-900 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize your experience and preferences.</p>
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'profile', icon: User, label: 'Profile' },
                    { id: 'notifications', icon: Bell, label: 'Notifications' },
                    { id: 'appearance', icon: Palette, label: 'Appearance' },
                    { id: 'privacy', icon: Shield, label: 'Privacy' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <main className="p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Update your personal information and bio.</p>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                        <input
                          value={profileForm.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                          value={profileForm.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea
                          rows={4}
                          value={profileForm.bio}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Tell us something about yourself"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
                      >
                        Save Profile
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Notification Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Choose which notifications you want to receive.</p>
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Email Notifications', description: 'Receive all notifications via email.' },
                        { key: 'taskUpdates', label: 'Task Updates', description: 'Get alerts for task changes.' },
                        { key: 'boardInvites', label: 'Board Invitations', description: 'Receive board invitations.' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key]}
                              onChange={() => handleToggleNotification(item.key)}
                              className="sr-only peer"
                            />
                            <span className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-blue-400 peer-checked:bg-blue-600 transition"></span>
                            <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Appearance Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Switch your theme and customize the app look.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 hover:border-blue-400'
                        }`}
                      >
                        <p className="font-semibold">Light Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bright interface with light backgrounds.</p>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 hover:border-blue-400'
                        }`}
                      >
                        <p className="font-semibold">Dark Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low-light theme with high contrast.</p>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Privacy Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Control visibility and activity preferences.</p>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'profileVisibility',
                          label: 'Profile Visibility',
                          description: 'Allow others to see your profile details.',
                        },
                        {
                          key: 'activityStatus',
                          label: 'Activity Status',
                          description: 'Show when you are active inside the app.',
                        },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy[item.key]}
                              onChange={() => handleTogglePrivacy(item.key)}
                              className="sr-only peer"
                            />
                            <span className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full transition peer peer-checked:bg-blue-600"></span>
                            <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
