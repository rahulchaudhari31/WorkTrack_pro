import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { Search, RefreshCw, Users, Phone, Briefcase, IndianRupee, UserMinus } from 'lucide-react';
import api from '../services/api';

const statusClass = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  on_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  terminated: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const Employees = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (search.trim()) params.set('search', search.trim());
    if (status) params.set('status', status);
    return params.toString();
  }, [search, status]);

  const { data, isLoading, refetch, isFetching } = useQuery(
    ['employees', query],
    () => api.get(`/employees?${query}`).then(r => r.data),
    { keepPreviousData: true }
  );

  const { data: stats } = useQuery('dashboard-stats', () =>
    api.get('/dashboard/stats').then(r => r.data.data),
    { staleTime: 60000 }
  );

  const employees = data?.data || [];
  const total = data?.pagination?.total || employees.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employees</h2>
          <p className="text-sm text-gray-500">Manage employee records and team details.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees"
              className="input pl-9 sm:w-64"
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input sm:w-48">
            <option value="">All Employment Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On leave</option>
            <option value="terminated">Terminated</option>
          </select>
          <button onClick={() => refetch()} className="btn-secondary flex items-center justify-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-green-500">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Shown</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {employees.filter(emp => emp.status === 'active').length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-500">
            <UserMinus className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">On Leave Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.attendance_today?.on_leave_count || 0}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-500">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Daily Wage Avg</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{employees.length
                ? Math.round(employees.reduce((sum, emp) => sum + Number(emp.daily_wage || 0), 0) / employees.length).toLocaleString('en-IN')
                : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : employees.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium text-gray-500">Employee</th>
                  <th className="pb-3 font-medium text-gray-500">Contact</th>
                  <th className="pb-3 font-medium text-gray-500">Department</th>
                  <th className="pb-3 font-medium text-gray-500">Designation</th>
                  <th className="pb-3 font-medium text-gray-500">Wage</th>
                  <th className="pb-3 font-medium text-gray-500">Employment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {employees.map(emp => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-semibold">
                          {emp.full_name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{emp.full_name}</p>
                          <p className="text-xs text-gray-400">{emp.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {emp.mobile_number}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{emp.department_name || '-'}</td>
                    <td className="py-3 pr-4 text-gray-500">{emp.designation || '-'}</td>
                    <td className="py-3 pr-4 text-gray-900 dark:text-white">
                      ₹{Number(emp.daily_wage || 0).toLocaleString('en-IN')}
                      <span className="text-xs text-gray-400"> / day</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[emp.status] || statusClass.inactive}`}>
                        {emp.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">No employees found</p>
            <p className="text-sm text-gray-500 mt-1">Add rows in MySQL or clear your filters and refresh.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
