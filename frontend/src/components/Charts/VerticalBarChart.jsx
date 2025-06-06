import React, {useState} from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';



const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];



const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow text-sm">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-600 dark:text-gray-300">
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const VerticalBarChart = ({
  data = [],
  title = 'Comparison Overview',
}) => {


    

  return (
    <div className="w-full max-w-full h-[420px] p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-md font-semibold text-gray-700 dark:text-gray-100 mb-4 uppercase tracking-wide">
        {title}
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />  

          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: 10,
              fontSize: '0.85rem',
              color: '#6b7280',
            }}
          />
          <Bar
            dataKey="completionRate"
            fill={COLORS[0]}
            radius={[8, 8, 0, 0]}
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VerticalBarChart;
