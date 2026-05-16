import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  Users, UserCheck, UserX, DollarSign,
  Clock, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PAYMENT_BARS = [
  { key: 'daily', label: 'Daily', color: '#22c55e' },
  { key: 'weekly', label: 'Weekly', color: '#6366f1' },
  { key: 'monthly', label: 'Monthly', color: '#14b8a6' },
  { key: 'advance', label: 'Advance', color: '#f97316' },
  { key: 'bonus', label: 'Bonus', color: '#eab308' },
  { key: 'deduction', label: 'Deduction', color: '#ef4444' },
];

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="card flex items-start gap-4"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const liveOptions = {
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  };
  const {
    data: stats,
    refetch: refetchStats,
    isFetching: fetchingStats,
  } = useQuery('dashboard-stats', () =>
    api.get('/dashboard/stats').then(r => r.data.data),
    liveOptions
  );
  const {
    data: monthly,
    refetch: refetchMonthly,
    isFetching: fetchingMonthly,
  } = useQuery('monthly-attendance', () =>
    api.get('/dashboard/monthly-attendance').then(r =>
      r.data.data.map(d => ({ ...d, name: MONTHS[d.month - 1] }))
    ),
    liveOptions
  );
  const {
    data: deptSalary,
    refetch: refetchDeptSalary,
    isFetching: fetchingDeptSalary,
  } = useQuery('dept-salary', () =>
    api.get('/dashboard/salary-by-dept').then(r => r.data.data),
    liveOptions
  );

  const att = stats?.attendance_today || {};
  const isRefreshing = fetchingStats || fetchingMonthly || fetchingDeptSalary;
  const refreshDashboard = () => {
    refetchStats();
    refetchMonthly();
    refetchDeptSalary();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <button onClick={refreshDashboard} className="btn-secondary flex items-center justify-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={stats?.total_employees} icon={Users} color="bg-primary-600" />
        <StatCard label="Present Today"   value={att.present_count}              icon={UserCheck} color="bg-green-500" />
        <StatCard label="Absent Today"    value={att.absent_count}               icon={UserX} color="bg-red-500" />
        <StatCard
          label="Salary Paid (Month)"
          value={`₹${Number(stats?.salary_paid_month || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Half Days"        value={att.half_day_count}             icon={Clock}      color="bg-yellow-500" />
        <StatCard label="Pending Payments" value={stats?.pending_payments?.count} icon={AlertCircle} color="bg-orange-500" sub={`₹${Number(stats?.pending_payments?.total||0).toLocaleString('en-IN')} pending`} />
        <StatCard label="New This Month"   value={stats?.new_employees_month}      icon={TrendingUp} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Attendance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly || []}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="present"  stroke="#4f46e5" fill="url(#gPresent)" name="Present" />
              <Area type="monotone" dataKey="absent"   stroke="#ef4444" fill="none"          name="Absent" />
              <Area type="monotone" dataKey="half_day" stroke="#f59e0b" fill="none"          name="Half Day" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Salary by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptSalary || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="department" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
              {PAYMENT_BARS.map(bar => (
                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  stackId="payments"
                  fill={bar.color}
                  name={bar.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3">
            {PAYMENT_BARS.map(bar => (
              <span key={bar.key} className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: bar.color }} />
                {bar.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
