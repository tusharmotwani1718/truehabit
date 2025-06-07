import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

function PieChartComponent({
  data = [],
  title = 'Pie Chart Overview'
}) {
  const themeColors = ['var(--color-chart-1)', 'var(--color-chart-2)'];

  // Track window size to adjust chart radius
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamically set radius based on screen size
  const getChartRadius = () => {
    if (windowWidth < 640) return { outer: 100, inner: 70 }; // small screen (e.g., mobile)
    if (windowWidth < 768) return { outer: 80, inner: 60 }; // tablets
    return { outer: 120, inner: 90 }; // desktops and up
  };

  const radius = getChartRadius();

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
            --color-chart-1: #673AB7;
            --color-chart-2: #261FB3;
          }
          .dark .chart-theme {
            --color-chart-1: #BB86FC;
            --color-chart-2: rgb(92, 107, 192);
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
              outerRadius={radius.outer}
              innerRadius={radius.inner}
              // label={renderLabel}
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
