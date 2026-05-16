exports.calculateSalary = ({ salary_type, daily_wage, monthly_salary, half_day_wage, attendance }) => {
  const present   = attendance.filter(r => r.status === 'present').length;
  const halfDays  = attendance.filter(r => r.status === 'half_day').length;
  const overtime  = attendance.reduce((sum, record) => sum + parseFloat(record.overtime_hours || 0), 0);

  let baseAmount = 0;
  if (salary_type === 'monthly') {
    const dailyRate = parseFloat(monthly_salary) / 26;
    baseAmount = dailyRate * (present + halfDays * 0.5);
  } else {
    baseAmount = (present * parseFloat(daily_wage)) + (halfDays * parseFloat(half_day_wage));
  }

  const overtimeRate = parseFloat(daily_wage) / 8 * 1.5;
  const overtimeAmount = overtime * overtimeRate;

  return {
    present,
    halfDays,
    overtime,
    baseAmount,
    overtimeRate,
    overtimeAmount,
    netAmount: baseAmount + overtimeAmount,
  };
};
