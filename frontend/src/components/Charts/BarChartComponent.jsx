import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  ResponsiveContainer
} from 'recharts';

function BarChartComponent({
  title,
  subTitle,
  data,
  timePeriod = "week",
}) {

  // console.log(data[0])
  

  // Calculate the percent change
  const percentChange = (data[0].currentStats - data[0].previousStats).toFixed(2);
  const isDecrease = percentChange < 0;
  
  // State to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Custom colors for the chart elements with light/dark mode support
  const colors = {
    currentStats: isDarkMode ? '#9575CD' : '#673AB7', // Light purple in dark mode
    previousStats: isDarkMode ? '#5C6BC0' : '#261FB3', // Light blue in dark mode
  };
  
  // Check for dark mode on component mount and when theme changes
  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
      
      // Setup observer for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      // Cleanup
      return () => observer.disconnect();
    }
  }, []);
  
  // Custom Legend formatter to control the colored dots
  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    return (
      <span style={{ color }}>
        {value}
      </span>
    );
  };

  return (
    <div className="w-full bg-background dark:bg-[#2b0051] rounded-lg shadow-xl p-5 my-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {title}
      </h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Chart Section - Reduced height */}
        <div className="w-full md:w-1/2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
              barGap={20}
              barSize={60}
              layout="vertical"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                className="text-gray-200 dark:text-gray-700" 
                opacity={0.3} 
                horizontal={false}
              />
              <XAxis 
                type="number"
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-300"
                tickFormatter={(value) => `${value}%`}
                allowDecimals={false}
                domain={[0, 100]}
              />
              <YAxis 
                dataKey="name"
                type="category"
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-300"
                width={100}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                
              />
             
              <Legend 
                verticalAlign="top"
                align="center"
                iconType="circle"
                formatter={renderColorfulLegendText}
                wrapperStyle={{ paddingBottom: '10px' }}
                className="text-gray-700 dark:text-gray-300"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  color: isDarkMode ? '#e5e7eb' : '#374151'
                }}
                labelStyle={{
                  color: isDarkMode ? '#e5e7eb' : '#374151'
                }}
              />
              <Bar 
                dataKey="previousStats" 
                name={data[0].label2} 
                fill={colors.previousStats}
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
                minPointSize={2}
                label={{ 
                  position: 'right', 
                  formatter: (value) => `${value}%`,
                  fill: colors.previousStats,
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="dark:fill-blue-400 fill-blue-700"
              />
              <Bar 
                dataKey="currentStats" 
                name={data[0].label1}
                fill={colors.currentStats}
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
                minPointSize={2}
                label={{ 
                  position: 'right', 
                  formatter: (value) => `${value}%`,
                  fill: colors.currentStats,
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="dark:fill-purple-400 fill-purple-700"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats Cards */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">{data[0].label1}</p>
              <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-400">{data[0].currentStats}%</h2>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">{data[0].label2}</p>
              <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400">{data[0].previousStats}%</h2>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${isDecrease ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subTitle}</p>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${isDecrease ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {percentChange}%
              </span>
              <span className={`ml-2 ${isDecrease ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {isDecrease ? '↓' : '↑'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Analysis</p>
            <p className="text-gray-700 dark:text-gray-300 mt-1">
              {isDecrease 
                ? `Completion rate decreased by ${Math.abs(percentChange)}% compared to last ${timePeriod}.` 
                : `Completion rate improved by ${percentChange}% compared to last ${timePeriod}.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarChartComponent;