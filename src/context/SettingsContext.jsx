import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    appName: 'ডেইলি এক্সাম বিডি',
    logoUrl: '/logo.svg',
    primaryContact: '',
    whatsappNumber: '',
    defaultExamDuration: 20,
    defaultPassingPercentage: 50,
    leaderboardDefault: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refreshSettings: fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
