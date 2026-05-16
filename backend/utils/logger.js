exports.log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

exports.error = (...args) => {
  console.error(...args);
};
