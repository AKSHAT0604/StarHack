import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PieController,
  LineController
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  LineController  // Add LineController to the registration
);

interface HealthMetric {
  type: string;
  value: number;
  unit: string;
}

interface FinancialMetric {
  type: string;
  value: number;
  description: string;
}

interface AppointmentType {
  id: number;
  type: string;
  available: boolean;
  specialist: string;
  time: string;
}

interface Article {
  id: number;
  title: string;
  category: 'health' | 'mental' | 'nutrition' | 'finance';
  summary: string;
  imageUrl: string;
}

const Dashboard: React.FC = () => {
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartInstance = useRef<ChartJS | null>(null);
  const pieChartInstance = useRef<ChartJS | null>(null);

  const [metrics, setMetrics] = useState<HealthMetric[]>([
    { type: 'Steps', value: 8743, unit: 'steps' },
    { type: 'Water', value: 6, unit: 'glasses' },
    { type: 'Sleep', value: 7.5, unit: 'hours' },
    { type: 'Heart Rate', value: 72, unit: 'bpm' },
  ]);

  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([
    { type: 'Wellness Budget', value: 450, description: 'Monthly allocation for health/wellness' },
    { type: 'Spent', value: 275, description: 'Amount used this month' },
    { type: 'Savings', value: 1250, description: 'Health savings accumulated' }
  ]);

  const [appointments, setAppointments] = useState<AppointmentType[]>([
    { id: 1, type: 'Nutritionist', specialist: 'Dr. Jessica Smith', time: 'Tomorrow, 10:00 AM', available: true },
    { id: 2, type: 'Personal Trainer', specialist: 'Mike Johnson', time: 'Wednesday, 5:30 PM', available: true },
    { id: 3, type: 'Wellness Coach', specialist: 'Sarah Williams', time: 'Friday, 2:00 PM', available: true }
  ]);

  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      title: 'The Link Between Exercise and Mental Health',
      category: 'mental',
      summary: 'Recent studies show that regular exercise can significantly reduce symptoms of depression and anxiety.',
      imageUrl: 'https://placehold.co/600x400/png?text=Mental+Health'
    },
    {
      id: 2,
      title: '10 Superfoods to Boost Your Immune System',
      category: 'nutrition',
      summary: 'Incorporate these powerful foods into your diet to strengthen your body\'s natural defenses.',
      imageUrl: 'https://placehold.co/600x400/png?text=Nutrition'
    },
    {
      id: 3,
      title: 'Financial Wellness: Budgeting for Health',
      category: 'finance',
      summary: 'Learn how to effectively budget for health and wellness without breaking the bank.',
      imageUrl: 'https://placehold.co/600x400/png?text=Financial+Wellness'
    },
    {
      id: 4,
      title: 'Mindfulness Techniques for Busy Professionals',
      category: 'mental',
      summary: 'Quick and effective mindfulness exercises you can practice during your workday.',
      imageUrl: 'https://placehold.co/600x400/png?text=Mindfulness'
    }
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
  
  const financialData = {
    labels: ['Spent', 'Remaining'],
    datasets: [
      {
        data: [275, 175],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Wellness Budget Usage',
      },
    },
    cutout: '70%',
  };

  const updateMetric = (type: string, newValue: number) => {
    setMetrics(metrics.map(metric => 
      metric.type === type ? { ...metric, value: newValue } : metric
    ));
  };

  const bookAppointment = (id: number) => {
    setAppointments(appointments.map(appointment =>
      appointment.id === id ? { ...appointment, available: false } : appointment
    ));
    alert(`Appointment with ${appointments.find(a => a.id === id)?.specialist} booked!`);
  };

  // Create or update charts when component mounts or data changes
  useEffect(() => {
    // Setup line chart
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy previous chart if it exists
        if (lineChartInstance.current) {
          lineChartInstance.current.destroy();
        }
        
        // Create new line chart with the correct type
        lineChartInstance.current = new ChartJS(ctx, {
          type: 'line',  // This should now be recognized since LineController is registered
          data: weeklyData,
          options: chartOptions
        });
      }
    }
    
    // Setup pie chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy previous chart if it exists
        if (pieChartInstance.current) {
          pieChartInstance.current.destroy();
        }
        
        // Create new pie chart
        pieChartInstance.current = new ChartJS(ctx, {
          type: 'pie',
          data: financialData,
          options: doughnutOptions
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, [weeklyData, financialData]); // Re-run when data changes

  return (
    <div className="dashboard">
      <h1>Health & Wellness Dashboard</h1>
      
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
      
      <section className="dashboard-row">
        <div className="chart-container">
          <canvas ref={lineChartRef}></canvas>
        </div>
        
        <div className="financial-wellness">
          <h2>Financial Wellness</h2>
          <div className="budget-chart">
            <canvas ref={pieChartRef}></canvas>
          </div>
          <div className="financial-metrics">
            {financialMetrics.map((metric) => (
              <div key={metric.type} className="financial-metric-card">
                <h4>{metric.type}</h4>
                <div className="financial-value">${metric.value}</div>
                <div className="financial-description">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="appointment-section">
        <h2>Book a Specialist</h2>
        <div className="appointments-container">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-type">{appointment.type}</div>
              <div className="appointment-specialist">{appointment.specialist}</div>
              <div className="appointment-time">{appointment.time}</div>
              <button 
                className="book-button"
                onClick={() => bookAppointment(appointment.id)}
                disabled={!appointment.available}
              >
                {appointment.available ? 'Book Appointment' : 'Booked'}
              </button>
            </div>
          ))}
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

      <section className="health-insights">
        <h2>Health Insights & Articles</h2>
        <div className="article-filters">
          <button className="filter-button active">All</button>
          <button className="filter-button">Mental Wellbeing</button>
          <button className="filter-button">Nutrition</button>
          <button className="filter-button">Financial Wellness</button>
        </div>
        <div className="articles-container">
          {articles.map((article) => (
            <div key={article.id} className={`article-card ${article.category}`}>
              <div className="article-image" style={{backgroundImage: `url(${article.imageUrl})`}} />
              <div className="article-content">
                <span className="article-category">{article.category}</span>
                <h4>{article.title}</h4>
                <p>{article.summary}</p>
                <a href="#" className="read-more">Read More</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
