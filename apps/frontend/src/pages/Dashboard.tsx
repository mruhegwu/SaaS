import React from 'react';
import { useAuthStore } from '../store/authStore';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: '1,234', change: '+12%' },
          { label: 'Active Sessions', value: '89', change: '+5%' },
          { label: 'Revenue', value: '$12,345', change: '+18%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
          </div>
        ))}
      </div>
    </div>
  );
};
