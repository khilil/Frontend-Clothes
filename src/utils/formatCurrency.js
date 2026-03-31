export const formatCurrency = (amount) => {
  const value = Number(amount);
  return '₹' + (isNaN(value) ? '0' : value.toLocaleString());
};

