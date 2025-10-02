import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';

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

interface HealthMetric {
  type: string;
  value: number;
  unit: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    { type: 'Steps', value: 8743, unit: 'steps' },
    { type: 'Water', value: 6, unit: 'glasses' },
    { type: 'Sleep', value: 7.5, unit: 'hours' },
    { type: 'Heart Rate', value: 72, unit: 'bpm' },
  ]);

  // Sample data for the chart
  const weeklyData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Steps',
        data: [7500, 8200, 7800, 9000, 8743, 10200, 9500],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Heart Rate',
        data: [68, 70, 74, 72, 72, 75, 71],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Health Metrics',
      },
    },
  };

  const updateMetric = (type: string, newValue: number) => {
    setMetrics(metrics.map(metric => 
      metric.type === type ? { ...metric, value: newValue } : metric
    ));
  };

  return (
    <div className="dashboard">
      <h1>Health Dashboard</h1>
      
      <section className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.type} className="metric-card">
            <h3>{metric.type}</h3>
            <div className="metric-value">
              {metric.value} <span className="unit">{metric.unit}</span>
            </div>
            <div className="metric-input">
              <button 
                onClick={() => updateMetric(metric.type, metric.value - 1)}
                disabled={metric.value <= 0}
              >
                -
              </button>
              <input 
                type="number" 
                value={metric.value} 
                onChange={(e) => updateMetric(metric.type, Number(e.target.value))}
              />
              <button onClick={() => updateMetric(metric.type, metric.value + 1)}>
                +
              </button>
            </div>
          </div>
        ))}
      </section>
      
      <section className="health-charts">
        <div className="chart-container">
          <Line options={chartOptions} data={weeklyData} />
        </div>
      </section>
      
      <section className="health-tips">
        <h2>Today's Health Tips</h2>
        <div className="tips-container">
          <div className="tip-card">
            <h4>Stay Hydrated</h4>
            <p>Remember to drink at least 8 glasses of water today!</p>
          </div>
          <div className="tip-card">
            <h4>Take a Break</h4>
            <p>For every hour of sitting, stand up and stretch for 5 minutes.</p>
          </div>
          <div className="tip-card">
            <h4>Mindfulness</h4>
            <p>Practice deep breathing for 5 minutes to reduce stress.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
