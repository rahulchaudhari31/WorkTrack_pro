import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CheckCircle2, Clock, CreditCard, IndianRupee, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusClass = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const Payments = () => {
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');
  const qc = useQueryClient();

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (status) params.set('status', status);
    if (period) params.set('period', period);
    return params.toString();
  }, [status, period]);

  const { data, isLoading, isFetching, refetch } = useQuery(
    ['payments', query],
    () => api.get(`/payments?${query}`).then(r => r.data),
    { keepPreviousData: true, staleTime: 0, refetchOnMount: 'always' }
  );

  const markPaid = useMutation(
    (paymentId) => api.patch(`/payments/${paymentId}/mark-paid`, {}),
    {
      onSuccess: () => {
        toast.success('Payment marked as paid');
        qc.invalidateQueries('payments');
        qc.invalidateQueries('dashboard-stats');
        qc.invalidateQueries('dept-salary');
      },
    }
  );

  const updateStatus = useMutation(
    ({ paymentId, newStatus }) => api.patch(`/payments/${paymentId}/status`, { status: newStatus }),
    {
      onSuccess: (resp) => {
        toast.success(resp.data.message);
        qc.invalidateQueries('payments');
        qc.invalidateQueries('dashboard-stats');
        qc.invalidateQueries('dept-salary');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to update status');
      },
    }
  );

  const payments = data?.data || [];
  const total = data?.pagination?.total || payments.length;
  const totalAmount = data?.pagination?.total_amount || payments.reduce((sum, pay) => sum + Number(pay.net_amount || 0), 0);
  const paidCount = payments.filter(pay => pay.payment_status === 'paid').length;
  const pendingCount = payments.filter(pay => pay.payment_status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payments</h2>
          <p className="text-sm text-gray-500">View salary payments and update payment status.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)} className="input sm:w-40">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input sm:w-40">
            <option value="">All periods</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="advance">Advance</option>
            <option value="bonus">Bonus</option>
            <option value="deduction">Deduction</option>
          </select>
          <button onClick={() => refetch()} className="btn-secondary flex items-center justify-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary-600">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-green-500">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid Shown</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-500">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{pendingCount ? 'Filtered Total' : 'Total Amount'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium text-gray-500">Payment</th>
                  <th className="pb-3 font-medium text-gray-500">Employee</th>
                  <th className="pb-3 font-medium text-gray-500">Period</th>
                  <th className="pb-3 font-medium text-gray-500">Attendance</th>
                  <th className="pb-3 font-medium text-gray-500">Amount</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map(pay => (
                  <motion.tr
                    key={pay.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900 dark:text-white">{pay.payment_code}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(pay.period_from)} - {formatDate(pay.period_to)}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900 dark:text-white">{pay.full_name}</p>
                      <p className="text-xs text-gray-400">{pay.employee_code}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 capitalize">{pay.payment_period}</td>
                    <td className="py-3 pr-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {pay.present_days} present, {pay.half_days} half
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(pay.net_amount)}</p>
                      <p className="text-xs text-gray-400">Base {formatCurrency(pay.base_amount)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={pay.payment_status}
                        onChange={(e) => updateStatus.mutate({ paymentId: pay.id, newStatus: e.target.value })}
                        disabled={updateStatus.isLoading}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition ${statusClass[pay.payment_status] || statusClass.cancelled}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {pay.paid_at && <p className="text-xs text-gray-400 mt-1">{formatDate(pay.paid_at)}</p>}
                    </td>
                    <td className="py-3">
                      {updateStatus.isLoading ? (
                        <div className="text-xs text-gray-400">Updating...</div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">No payments found</p>
            <p className="text-sm text-gray-500 mt-1">Create records in MySQL or clear your filters and refresh.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
