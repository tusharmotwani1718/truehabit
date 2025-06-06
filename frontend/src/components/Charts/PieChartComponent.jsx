import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';



function PieChartComponent({
  data = [],
  title = 'Pie Chart Overview'
}) {
  const themeColors = ['var(--color-chart-1)', 'var(--color-chart-2)'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md px-3 py-2 text-sm text-gray-800 dark:text-gray-100">
          <p className="font-semibold">{item.name}</p>
          <p>Value: {item.value}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`;

  return (
    <div className="w-full mx-auto md:mx-0 p-4 py-8 my-4 shadow-md rounded-lg">
      <style>
        {`
          .chart-theme {
            --color-chart-1: #673AB7; /* Indigo (light) */
            --color-chart-2: #261FB3; /* Blue (light) */
          }
          .dark .chart-theme {
            --color-chart-1: #BB86FC; /* Light Purple (dark) */
            --color-chart-2: rgb(92, 107, 192); /* Soft Blue (dark) */
          }
        `}
      </style>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">{title}</h2>
      <div className="chart-theme">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={70}
              label={renderLabel}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={themeColors[index % themeColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" wrapperStyle={{ color: 'inherit' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PieChartComponent;
