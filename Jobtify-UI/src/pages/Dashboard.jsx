import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import '../css/CustomCard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [userName, setUserName] = useState(() => {
        const storedUserName = localStorage.getItem('UserName');
        return storedUserName ? JSON.parse(storedUserName) : '';
    });

    const [userEmail, setUserEmail] = useState(() => {
        const storedUserEmail = localStorage.getItem('UserEmail');
        return storedUserEmail ? JSON.parse(storedUserEmail) : '';
    });

    const [greeting, setGreeting] = useState('');
    const [applications, setApplications] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour > 6 && currentHour < 12) {
            setGreeting('Good Morning');
        } else if (currentHour >= 12 && currentHour < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }
    }, []);

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

                const monthlyGroups = data.reduce((acc, app) => {
                    const date = new Date(app.timeOfApplication);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!acc[monthKey]) {
                        acc[monthKey] = 0;
                    }
                    acc[monthKey]++;
                    return acc;
                }, {});

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

    const generateAvatarName = (name) => {
        if (!name) return 'NA';
        const words = name.split(' ');
        const firstLetter = words[0]?.[0] || '';
        const lastLetter = name.match(/[A-Z](?!.*[A-Z])/g)?.[0] || '';
        return `${firstLetter}${lastLetter}`.toUpperCase();
    };

    const chartData = {
        labels: monthlyData.map((item) => item.month),
        datasets: [
            {
                label: 'Applications Per Month',
                data: monthlyData.map((item) => item.applications),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
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

    const applicationStatusCounts = applications.reduce((acc, app) => {
        const status = app.applicationStatus || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const barChartData = {
        labels: Object.keys(applicationStatusCounts),
        datasets: [
            {
                label: 'Number of Applications by Status',
                data: Object.values(applicationStatusCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const barChartOptions = {
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
                    text: 'Status',
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

    const userData = {
        name: userName,
        email: userEmail,
    };

    return (
        <div style={{backgroundColor: '#000', minHeight: '100vh', width: '80%', margin: '50px auto'}}>
            <h2 style={{color: '#fff', textAlign: 'center', fontSize: 48, padding: 50, fontWeight: "bold"}}>Dashboard</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '20px',
                margin: '0 auto',
                marginBottom: '20px'
            }}>
                <div className="ag-courses-item_link" style={{position: 'relative', zIndex: 2}}>
                    <div style={{textAlign: 'center'}}>
                        <br/>
                        <div style={avatarStyle}>{generateAvatarName(userData.name)}</div>
                        <br/>
                        <h3>{greeting}</h3>
                        <h3>{userData.name}</h3>
                        <br/>
                        <p>{userData.email}</p>
                    </div>
                </div>

                <div className="ag-courses-item_link" style={{position: 'relative', zIndex: 2}}>
                    <div style={{textAlign: 'center'}}>
                        <h4>Monthly Application Trends</h4>
                    </div>
                    {monthlyData.length > 0 ? (
                        <Line data={chartData} options={chartOptions}/>
                    ) : (
                        <p>Loading chart...</p>
                    )}
                </div>
            </div>

            <div className="ag-courses-item_link" style={{position: 'relative', zIndex: 2}}>
                <div style={{textAlign: 'center'}}>
                    <h4>Application Status</h4>
                </div>
                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    {applications.length > 0 ? (
                        <Bar data={barChartData} options={barChartOptions}/>
                    ) : (
                        <p style={{color: '#fff'}}>Loading chart...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#00aaff',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 10px',
    textTransform: 'uppercase',
};

export default Dashboard;
