function calculateAverageRating(array) {
  const numericArray = array.map(Number).filter((n) => !isNaN(n));

  const sum = numericArray.reduce((acc, val) => acc + val, 0);
  const result = array.length ? sum / array.length : 0;
  return Number(result.toFixed(1))
}

module.exports = { calculateAverageRating };
