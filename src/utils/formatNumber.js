/**
 * Format number with commas as thousands separator
 * Removes decimal places if they are .00 or if value is null/undefined
 * Example: 5567850 -> "55,67,850"
 * Example: 5567637.75 -> "55,67,637.75"
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  // Convert to number
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return 'N/A';
  }

  // Check if the decimal part is 0 or doesn't exist
  const isWholeNumber = num % 1 === 0;
  
  // Format the number with commas using toLocaleString
  if (isWholeNumber) {
    // For whole numbers, use Indian numbering system
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  } else {
    // For decimal numbers, keep up to 2 decimal places
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
};
