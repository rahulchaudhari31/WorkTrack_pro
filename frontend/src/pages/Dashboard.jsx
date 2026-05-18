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
  ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DEPT_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444',
  '#facc15', '#14b8a6', '#6366f1', '#ec4899', '#84cc16',
];
const DEPT_AMOUNT_KEYS = [
  'total', 'estimated_salary', 'total_payments', 'paid', 'pending',
  'payment_count', 'daily', 'weekly', 'monthly', 'advance', 'bonus', 'deduction',
];

const normalizeDeptSalary = (rows = []) => rows.map(row => ({
  ...row,
  ...Object.fromEntries(DEPT_AMOUNT_KEYS.map(key => [key, Number(row[key] || 0)])),
}));

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
    refetchOnWindowFocus: false,
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
    api.get('/dashboard/salary-by-dept').then(r => normalizeDeptSalary(r.data.data)),
    liveOptions
  );

  const att = stats?.attendance_today || {};
  const isRefreshing = fetchingStats || fetchingMonthly || fetchingDeptSalary;
  const deptRows = deptSalary || [];
  const deptChartHeight = Math.max(260, deptRows.length * 44);
  const monthlyChartKey = `monthly-${monthly?.length || 0}-${monthly?.map(row => `${row.name}:${row.present}:${row.absent}:${row.half_day}`).join('|') || 'empty'}`;
  const deptChartKey = `dept-${deptRows.length}-${deptRows.map(row => `${row.department}:${row.total}`).join('|')}`;
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
          <div className="h-[240px] min-w-0">
            <ResponsiveContainer key={monthlyChartKey} width="100%" height="100%">
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
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Salary by Department</h3>
          <div style={{ height: deptChartHeight }} className="min-w-0">
            <ResponsiveContainer key={deptChartKey} width="100%" height="100%">
              <BarChart data={deptRows} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="department" type="category" interval={0} tick={{ fontSize: 12 }} width={120} />
                <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="total" name="Total Salary" radius={[8, 8, 8, 8]} barSize={20}>
                  {deptRows.map((entry, index) => (
                    <Cell key={`cell-${entry.department}-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {deptRows.map((row, index) => (
              <span key={`legend-${row.department}`} className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length] }} />
                {row.department}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
