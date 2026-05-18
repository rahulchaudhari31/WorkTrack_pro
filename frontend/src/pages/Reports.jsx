import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import {
  AlertCircle, BarChart3, CalendarDays, Download, IndianRupee,
  RefreshCw, Users
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { format } from 'date-fns';
import api from '../services/api';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#6366f1'];
const DEPT_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444',
  '#facc15', '#14b8a6', '#6366f1', '#ec4899', '#84cc16',
];
const DEPT_AMOUNT_KEYS = [
  'total', 'estimated_salary', 'total_payments', 'paid', 'pending',
  'payment_count', 'daily', 'weekly', 'monthly', 'advance', 'bonus', 'deduction',
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const normalizeDeptSalary = (rows = []) => rows.map(row => ({
  ...row,
  ...Object.fromEntries(DEPT_AMOUNT_KEYS.map(key => [key, Number(row[key] || 0)])),
}));

const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const cell = value == null ? '' : String(value);
    return `"${cell.replace(/"/g, '""')}"`;
  };
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCell(row[header])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card flex items-center gap-3">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Reports = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const liveOptions = { staleTime: 0, refetchOnMount: 'always' };

  const statsQuery = useQuery(
    'report-dashboard-stats',
    () => api.get('/dashboard/stats').then(r => r.data.data),
    liveOptions
  );
  const employeesQuery = useQuery(
    'report-employees',
    () => api.get('/employees?limit=100').then(r => r.data.data),
    liveOptions
  );
  const paymentsQuery = useQuery(
    'report-payments',
    () => api.get('/payments?limit=100').then(r => r.data.data),
    liveOptions
  );
  const attendanceQuery = useQuery(
    ['report-attendance', date],
    () => api.get(`/attendance?date=${date}`).then(r => r.data.data),
    liveOptions
  );
  const deptSalaryQuery = useQuery(
    'report-dept-salary',
    () => api.get('/dashboard/salary-by-dept').then(r => normalizeDeptSalary(r.data.data)),
    liveOptions
  );

  const stats = statsQuery.data || {};
  const employees = employeesQuery.data || [];
  const payments = paymentsQuery.data || [];
  const attendance = attendanceQuery.data || [];
  const deptSalary = deptSalaryQuery.data || [];
  const att = stats.attendance_today || {};
  const deptChartHeight = Math.max(280, deptSalary.length * 44);

  const attendancePie = useMemo(() => ([
    { name: 'Present', value: Number(att.present_count || 0) },
    { name: 'Absent', value: Number(att.absent_count || 0) },
    { name: 'Half Day', value: Number(att.half_day_count || 0) },
    { name: 'Leave', value: Number(att.on_leave_count || 0) },
    { name: 'Not Marked', value: Number(att.not_marked_count || 0) },
  ]).filter(item => item.value > 0), [att]);

  const paymentSummary = useMemo(() => {
    return payments.reduce((acc, pay) => {
      const key = pay.payment_status || 'unknown';
      acc[key] = acc[key] || { status: key, count: 0, total: 0 };
      acc[key].count += 1;
      acc[key].total += Number(pay.net_amount || 0);
      return acc;
    }, {});
  }, [payments]);

  const paymentRows = Object.values(paymentSummary);
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalPayroll = payments.reduce((sum, pay) => sum + Number(pay.net_amount || 0), 0);
  const pendingDecisionCount = (paymentSummary.pending?.count || 0) + (paymentSummary.paid?.count || 0);
  const pendingDecisionTotal = Number(paymentSummary.pending?.total || 0) + Number(paymentSummary.paid?.total || 0);
  const isFetching = statsQuery.isFetching || employeesQuery.isFetching || paymentsQuery.isFetching ||
    attendanceQuery.isFetching || deptSalaryQuery.isFetching;

  const refreshAll = () => {
    statsQuery.refetch();
    employeesQuery.refetch();
    paymentsQuery.refetch();
    attendanceQuery.refetch();
    deptSalaryQuery.refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h2>
          <p className="text-sm text-gray-500">Generate attendance and payroll reports for your team.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input pl-9 sm:w-44"
            />
          </div>
          <button onClick={refreshAll} className="btn-secondary flex items-center justify-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Employees" value={activeEmployees} icon={Users} color="bg-primary-600" sub={`${employees.length} total records`} />
        <StatCard label="Present Today" value={att.present_count || 0} icon={CalendarDays} color="bg-green-500" sub={`${att.absent_count || 0} absent`} />
        <StatCard label="Payroll Records" value={payments.length} icon={IndianRupee} color="bg-indigo-500" sub={formatCurrency(totalPayroll)} />
        <StatCard label="Pending Payments" value={pendingDecisionCount} icon={AlertCircle} color="bg-orange-500" sub={formatCurrency(pendingDecisionTotal)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Mix</h3>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={attendancePie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {attendancePie.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
            {attendancePie.map((item, index) => (
              <div key={item.name} className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Department Payroll</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={deptChartHeight}>
            <BarChart data={deptSalary} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="department" type="category" interval={0} tick={{ fontSize: 12 }} width={120} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="total" name="Total Salary" radius={[8, 8, 8, 8]} barSize={20}>
                {deptSalary.map((entry, index) => (
                  <Cell key={`cell-${entry.department}-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3">
            {deptSalary.map((row, index) => (
              <span key={`legend-${row.department}`} className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length] }} />
                {row.department}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Report</h3>
            <button
              onClick={() => downloadCsv(`attendance-${date}.csv`, attendance)}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium text-gray-500">Employee</th>
                  <th className="pb-3 font-medium text-gray-500">Department</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {attendance.slice(0, 8).map(row => (
                  <tr key={row.employee_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900 dark:text-white">{row.full_name}</p>
                      <p className="text-xs text-gray-400">{row.employee_code}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{row.department_name || '-'}</td>
                    <td className="py-3 pr-4 text-gray-500 capitalize">{row.status?.replace('_', ' ')}</td>
                    <td className="py-3 text-gray-500">{row.time_in || '-'} - {row.time_out || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Payroll Report</h3>
            <button
              onClick={() => downloadCsv('payments-report.csv', payments)}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="space-y-3">
            {paymentRows.map(row => (
              <div key={row.status} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{row.status}</p>
                  <p className="text-xs text-gray-400">{row.count} records</p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(row.total)}</p>
              </div>
            ))}
            {!paymentRows.length && (
              <p className="text-sm text-gray-500">No payment data found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
