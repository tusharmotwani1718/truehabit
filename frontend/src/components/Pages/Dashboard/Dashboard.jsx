import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initDashboard, setHabitCount as setHabitCountSlice } from '../../../store/Slices/DashboardSlice';
import Spinner from '../../utils/Spinner';
import Topbar from '../../utils/Topbar';
import Card from '../../utils/Card';
import OptionSelect from '../../utils/OptionsSelect';
import { useMessage } from '../../../context';
import BarChartComponent from '../../Charts/BarChartComponent';
import PieChartComponent from '../../Charts/PieChartComponent';
import { Reveal } from '../../../framer-motion/index.js';
import { MdBarChart, MdInsertChartOutlined } from 'react-icons/md';

function Dashboard() {
  const dispatch = useDispatch();
  const { displayMessage } = useMessage();
  const { loading, error } = useSelector(state => state.dashboard);

  const [habitCount, setHabitCount] = useState(0);
  const [avgcompletionRate, setAvgCompletionRate] = useState(0);
  const [lastPeriodCompletionRate, setLastPeriodCompletionRate] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [optionId, setOptionId] = useState(1);

  const options = [
    { id: 1, label: 'This Week', fetchQuery: "thisWeek" },
    { id: 2, label: 'This Month', fetchQuery: "thisMonth" }
  ];

  const chartData = [
    {
      name: "Completion Rate",
      currentStats: avgcompletionRate,
      previousStats: lastPeriodCompletionRate,
      label1: optionId === 1 ? "This Week" : "This Month",
      label2: optionId === 1 ? "Last Week" : "Last Month",
    }
  ];

  const PieChartData = [
    { name: "Completed", value: avgcompletionRate },
    { name: "Missed", value: (100 - avgcompletionRate) },
  ];

  const lastTimePeriodPieChartData = [
    { name: "Completed", value: lastPeriodCompletionRate },
    { name: "Missed", value: (100 - lastPeriodCompletionRate) },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const selectedOption = options.find(option => option.id === optionId); // 👈 Move inside useEffect
        // console.log("Selected Option:", selectedOption);

        if (!selectedOption) return;

        const result = await dispatch(initDashboard(selectedOption.fetchQuery)).unwrap();
        const count = result.data.habitsWithCount[0]?.count[0]?.habitsCount;

        

        const habits = result.data.habitsWithCount[0].habits || [];
        const completionRate = result.data.avgCompletionRate;
        const lastPeriodCompletionRate = result.data.lastAvgCompletionRate;

        const data = {
          timePeriod: selectedOption.fetchQuery,
          count,
          completionRate,
          habits,
          lastPeriodCompletionRate
        };

        dispatch(setHabitCountSlice(data));
        if(count){
          setHabitCount(count);
        }
        else {
          setHabitCount(0);
        }
        setAvgCompletionRate(completionRate);
        setLastPeriodCompletionRate(lastPeriodCompletionRate);

      } catch (error) {
        console.error("Failed to load habits:", error);
        displayMessage('error', "Network Error");
        setHabitCount(0);
        dispatch(setHabitCountSlice({ count: 0, habits: [] }));
        setAvgCompletionRate(0);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [optionId, dispatch, displayMessage]);

  if (error) return null;

  if (loading || loadingData) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // {console.log(avgcompletionRate, lastPeriodCompletionRate)}

  return avgcompletionRate !== 0 || lastPeriodCompletionRate !== 0 ? (
  <>
    <section className="w-full md:w-[90%] mx-auto md:px-10 min-h-screen">
      <div>
        <Topbar text="Dashboard" className="h-20" />
      </div>

      {/* Cards - Responsive Stack */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mt-4 w-[95%] md:w-full mx-auto">
        <Card title="New Habits" content={habitCount} />
        <Card title="Completion Rate" content={`${avgcompletionRate}%`} />
      </div>

      {/* Option Selector */}
      <div className="my-10 w-[95%] md:w-full mx-auto">
        <OptionSelect
          options={options}
          selectedId={optionId}
          onSelect={(id) => setOptionId(id)}
        />
      </div>

      {/* Bar Chart */}
      <Reveal slideAnimation={false} width="100%">
        <BarChartComponent
          title={
            (optionId === 1 ? 'Weekly' : 'Monthly') +
            ' Completion Rate Comparison'
          }
          subTitle={optionId === 1 ? 'Weekly Change' : 'Monthly Change'}
          data={chartData}
          timePeriod={optionId === 1 ? 'week' : 'month'}
        />
      </Reveal>

      {/* Pie Charts - Responsive */}
      <Reveal slideAnimation={false} width="100%">
        <div className="w-full flex flex-col md:flex-row gap-6 justify-between">
          <PieChartComponent
            data={PieChartData}
            title={optionId === 1 ? 'This Week' : 'This Month'}
          />
          <PieChartComponent
            data={lastTimePeriodPieChartData}
            title={optionId === 1 ? 'Last Week' : 'Last Month'}
          />
        </div>
      </Reveal>
    </section>
  </>
) : (
  <div className="flex flex-col items-center justify-center py-24 text-center rounded-lg transition-all w-full md:w-[90%] mx-auto px-4 min-h-screen">
    <MdInsertChartOutlined className="w-16 h-16 mb-4 text-primary dark:text-dark-primary" />
    <h2 className="text-2xl font-semibold text-primary dark:text-dark-primary">
      No Data Available
    </h2>
    <p className="text-sm text-primary dark:text-dark-primary mt-2 max-w-md">
      Your dashboard insights will appear here once there’s enough activity to
      generate reports.
    </p>
  </div>
);

}

export default Dashboard;
