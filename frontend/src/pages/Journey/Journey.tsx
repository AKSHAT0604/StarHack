import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
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
} from 'chart.js';
import './Journey.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:8000';
const USER_ID = 1;

interface CommunityBreakdown {
  community_id: number;
  community_name: string;
  community_color: string;
  community_icon: string;
  total_points: number;
}

interface PointsHistory {
  date: string;
  total_points: number;
}

interface HealthMetric {
  metric_date: string;
  weight_kg: number | null;
  sleep_hours: number | null;
  water_intake_ml: number | null;
  steps: number | null;
  workout_minutes: number | null;
  mood_score: number | null;
  energy_level: number | null;
}

interface Achievement {
  achievement_title: string;
  achievement_description: string;
  achieved_at: string;
  achievement_type: string;
}

interface JourneyStats {
  days_active: number;
  member_since: string;
  communities_joined: number;
  quests_completed: number;
  achievements_earned: number;
  total_points: number;
  current_streak: number;
}

const Journey: React.FC = () => {
  const [communityBreakdown, setCommunityBreakdown] = useState<CommunityBreakdown[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [communityRes, pointsRes, healthRes, achievementsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/journey/community-breakdown/${USER_ID}`),
        fetch(`${API_URL}/journey/points-timeline/${USER_ID}`),
        fetch(`${API_URL}/journey/health-metrics/${USER_ID}`),
        fetch(`${API_URL}/journey/achievements/${USER_ID}`),
        fetch(`${API_URL}/journey/stats/${USER_ID}`),
      ]);

      const communityData = await communityRes.json();
      const pointsData = await pointsRes.json();
      const healthData = await healthRes.json();
      const achievementsData = await achievementsRes.json();
      const statsData = await statsRes.json();

      setCommunityBreakdown(communityData);
      setPointsHistory(pointsData);
      setHealthMetrics(healthData);
      setAchievements(achievementsData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching journey data:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="journey">
        <h1>Loading Your Journey...</h1>
      </div>
    );
  }

  // Pie Chart Data - Community Points
  const pieData = {
    labels: communityBreakdown.map(c => `${c.community_icon} ${c.community_name}`),
    datasets: [
      {
        label: 'Points Earned',
        data: communityBreakdown.map(c => c.total_points),
        backgroundColor: communityBreakdown.map(c => c.community_color),
        borderColor: communityBreakdown.map(c => c.community_color),
        borderWidth: 2,
      },
    ],
  };

  // Line Chart Data - Points Over Time
  const lineData = {
    labels: pointsHistory.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
    datasets: [
      {
        label: 'Total Points',
        data: pointsHistory.map(p => p.total_points),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#667eea',
      },
    ],
  };

  // Health Metrics Charts
  const weightData = {
    labels: healthMetrics.map(m => new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        label: 'Weight (kg)',
        data: healthMetrics.map(m => m.weight_kg),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sleepData = {
    labels: healthMetrics.map(m => new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        label: 'Sleep (hours)',
        data: healthMetrics.map(m => m.sleep_hours),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const hydrationData = {
    labels: healthMetrics.map(m => new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        label: 'Water Intake (ml)',
        data: healthMetrics.map(m => m.water_intake_ml),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const stepsData = {
    labels: healthMetrics.map(m => new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        label: 'Daily Steps',
        data: healthMetrics.map(m => m.steps),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="journey">
      <div className="journey-header">
        <h1>🌟 Your Journey</h1>
        <p className="journey-subtitle">
          Tracking your progress since {new Date(stats.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.days_active}</div>
          <div className="stat-label">Days Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.total_points.toLocaleString()}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.quests_completed}</div>
          <div className="stat-label">Quests Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.current_streak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.communities_joined}</div>
          <div className="stat-label">Communities</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎖️</div>
          <div className="stat-value">{stats.achievements_earned}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container full-width">
          <h2>📈 Points Progress Over Time</h2>
          <div className="chart-wrapper">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h2>🎯 Points by Community</h2>
          <div className="chart-wrapper">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h2>⚖️ Weight Progress</h2>
          <div className="chart-wrapper">
            <Line data={weightData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h2>😴 Sleep Quality</h2>
          <div className="chart-wrapper">
            <Line data={sleepData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h2>💧 Hydration Levels</h2>
          <div className="chart-wrapper">
            <Line data={hydrationData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h2>👟 Daily Steps</h2>
          <div className="chart-wrapper">
            <Line data={stepsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Achievements Timeline */}
      <div className="achievements-section">
        <h2>🏅 Achievements & Milestones</h2>
        <div className="achievements-timeline">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-item">
              <div className="achievement-icon">
                {achievement.achievement_type === 'streak' && '🔥'}
                {achievement.achievement_type === 'points_milestone' && '⭐'}
                {achievement.achievement_type === 'quest_completion' && '✅'}
                {achievement.achievement_type === 'community_joined' && '👥'}
              </div>
              <div className="achievement-content">
                <h4>{achievement.achievement_title}</h4>
                <p>{achievement.achievement_description}</p>
                <span className="achievement-date">
                  {new Date(achievement.achieved_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journey;
