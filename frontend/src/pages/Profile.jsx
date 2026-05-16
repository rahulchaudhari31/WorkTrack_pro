import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
        <p className="text-sm text-gray-500">Your account details and profile settings.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-medium">Name:</span> {user?.name}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
          <p className="text-sm text-gray-500">Dark mode and account preferences can be managed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
