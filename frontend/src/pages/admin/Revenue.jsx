import React from 'react';
import MonthlyRevenueChart from './MonthlyRevenueChart';

function Revenue() {
  return (
    <div className="container py-4">
      <h2 className="mb-4">📈 Venituri Produse</h2>
      <MonthlyRevenueChart />
    </div>
  );
}

export default Revenue;
