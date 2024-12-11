import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const userId = localStorage.getItem('UserID');
      if (!userId) return;

      try {
        const response = await fetch(
          `http://18.118.161.48:8080/api/application/user/${JSON.parse(userId)}/applications`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);

        // Process data for monthly stats
        const monthlyGroups = data.reduce((acc, app) => {
          const date = new Date(app.timeOfApplication);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!acc[monthKey]) {
            acc[monthKey] = 0;
          }
          acc[monthKey]++;
          return acc;
        }, {});

        // Convert to array and sort by date
        const sortedData = Object.entries(monthlyGroups)
          .map(([month, count]) => ({
            month,
            applications: count,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setMonthlyData(sortedData);
      } catch (err) {
        setError('Error fetching applications');
        console.error('Error:', err);
      }
    };

    fetchApplications();
  }, []);

  // Prepare data for the line chart
  const chartData = {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: 'Applications Per Month',
        data: monthlyData.map((item) => item.applications),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4, // Smooth the line
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Applications',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Total Applications</h2>
          <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Application Trends</h2>
        {monthlyData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
