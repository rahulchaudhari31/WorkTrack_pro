import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Calendar, Save, ChevronLeft, ChevronRight, Loader2, Clock, LogIn, LogOut } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['present','absent','half_day','leave'];
const STATUS_COLORS  = {
  present:  'badge-present',
  absent:   'badge-absent',
  half_day: 'badge-half-day',
  leave:    'badge-leave',
};

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const Attendance = () => {
  const [date, setDate]   = useState(format(new Date(), 'yyyy-MM-dd'));
  const [edits, setEdits] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(['attendance', date], () =>
    api.get(`/attendance?date=${date}`).then(r => r.data.data)
  );

  const bulkMutation = useMutation(
    () => {
      const records = Object.entries(edits).map(([employee_id, edit]) => ({
        employee_id: parseInt(employee_id),
        status: edit.status,
        time_in: edit.time_in || null,
        time_out: edit.time_out || null,
      }));
      return api.post('/attendance/bulk', { attendance_date: date, records });
    },
    {
      onSuccess: () => {
        toast.success('Attendance saved!');
        setEdits({});
        qc.invalidateQueries(['attendance', date]);
        qc.invalidateQueries('dashboard-stats');
        qc.invalidateQueries('monthly-attendance');
      }
    }
  );

  const changeDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const markAll = (status) => {
    const newEdits = {};
    (data || []).forEach(emp => {
      newEdits[emp.employee_id] = {
        status,
        time_in: emp.time_in || '',
        time_out: emp.time_out || '',
      };
    });
    setEdits(newEdits);
  };

  const updateEdit = (emp, field, value) => {
    setEdits(ed => ({
      ...ed,
      [emp.employee_id]: {
        status: ed[emp.employee_id]?.status ?? emp.status,
        time_in: ed[emp.employee_id]?.time_in ?? emp.time_in ?? '',
        time_out: ed[emp.employee_id]?.time_out ?? emp.time_out ?? '',
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h2>
          <p className="text-sm text-gray-500">Mark daily attendance for all employees</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="btn-secondary p-2">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input pl-9 w-44"
            />
          </div>
          <button onClick={() => changeDate(1)} className="btn-secondary p-2">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-500 self-center mr-2">Mark All:</span>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => markAll(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80 ${STATUS_COLORS[s]}`}>
              {s.replace('_',' ')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({length:6}).map((_,i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium text-gray-500">Employee</th>
                  <th className="pb-3 font-medium text-gray-500">Department</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Time In</th>
                  <th className="pb-3 font-medium text-gray-500">Time Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data || []).map(emp => {
                  const pending = edits[emp.employee_id] || {};
                  const currentStatus = pending.status ?? emp.status;
                  const currentTimeIn = pending.time_in ?? emp.time_in ?? '';
                  const currentTimeOut = pending.time_out ?? emp.time_out ?? '';
                  return (
                    <motion.tr
                      key={emp.employee_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {emp.profile_photo
                            ? <img src={emp.profile_photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                            : <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-semibold">
                                {emp.full_name.charAt(0)}
                              </div>
                          }
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{emp.full_name}</p>
                            <p className="text-xs text-gray-400">{emp.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{emp.department_name || '—'}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={currentStatus}
                          onChange={e => updateEdit(emp, 'status', e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1
                                     bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.replace('_',' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <div className="relative flex-1">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              type="time"
                              value={currentTimeIn}
                              onChange={e => updateEdit(emp, 'time_in', e.target.value)}
                              className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 pl-7 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateEdit(emp, 'time_in', getCurrentTime())}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                            title="Auto-fill current time"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <div className="relative flex-1">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              type="time"
                              value={currentTimeOut}
                              onChange={e => updateEdit(emp, 'time_out', e.target.value)}
                              className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 pl-7 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateEdit(emp, 'time_out', getCurrentTime())}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                            title="Auto-fill current time"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {Object.keys(edits).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
          >
            <button
              onClick={() => bulkMutation.mutate()}
              disabled={bulkMutation.isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {bulkMutation.isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />
              }
              Save {Object.keys(edits).length} Changes
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
