exports.safeParseFloat = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

exports.maskString = (value, visibleCount = 4) => {
  if (!value) return value;
  return value.replace(new RegExp(`.(?=.{${visibleCount}}$)`, 'g'), '*');
};
