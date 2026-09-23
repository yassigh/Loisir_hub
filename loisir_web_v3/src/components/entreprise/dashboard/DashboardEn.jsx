import React, { useEffect, useState, useRef } from 'react';
import KpiCard from './KpiCard';
import LineChart from './LineChart';
import BarChart from './BarChart';
import { entrepriseStatsService } from '../../../services/EntrepriseStatsService';
import ChartErrorBoundary from './ChartErrorBoundary';
import '../../../styles/dashboard.css';

const DashboardEn = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartInstancesRef = useRef([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await entrepriseStatsService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => {
      chartInstancesRef.current.forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);
  const formatMonthlyData = (monthlyData, type) => {
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultData = Array(12).fill(0);

    if (!monthlyData || monthlyData.length === 0) return {
      labels: monthLabels,
      data: defaultData
    };

    // Fill in the data for months that have values
    const filledData = defaultData.map((_, index) => {
      const monthItem = monthlyData.find(item => item.month === index + 1);
      return monthItem ? parseFloat(monthItem.total) : 0;
    });

    return {
      labels: monthLabels,
      data: filledData
    };
  };

  const prepareChartData = () => {
    const subscriptionData = formatMonthlyData(stats.monthlyStats?.subscriptions);
    const publiciteData = formatMonthlyData(stats.monthlyStats?.publicites);
    const revenueData = formatMonthlyData(stats.monthlyStats?.revenue);

    // Payments chart data
    const paymentsChartData = {
      labels: subscriptionData.labels,
      datasets: [
        {
          label: 'Abonnements',
          data: subscriptionData.data,
          borderColor: '#E91E63',
          fill: false
        },
        {
          label: 'Publicités',
          data: publiciteData.data,
          borderColor: '#2196F3',
          fill: false
        }
      ]
    };

    // Revenue chart data
    const revenueChartData = {
      labels: revenueData.labels,
      datasets: [{
        label: 'Revenus',
        data: revenueData.data,
        borderColor: '#4CAF50',
        fill: false
      }]
    };

    return { paymentsChartData, revenueChartData };
  };

  if (loading || !stats) return <div>Loading...</div>;
  const { paymentsChartData, revenueChartData } = prepareChartData();


  // Monthly payments chart data

  // Reservations by activity chart data
  const reservationsChartData = {
    labels: stats.reservations?.byActivity?.map(item => item.nomActP) || [],
    datasets: [{
      label: 'Réservations par Activité',
      data: stats.reservations?.byActivity?.map(item => item.total_reservations) || [],
      backgroundColor: '#2196F3'
    }]
  };

  return (
    <div className="dashboard">
      <div className="kpi-cards">
        <KpiCard 
          title="Total Clients" 
          value={stats.reservations?.totalClients || 0}
        />
        <KpiCard 
          title="Réservations" 
          value={stats.reservations?.total || 0}
        />
        <KpiCard 
          title="Revenue Total" 
          value={`${stats.revenue?.total || 0} DT`}
        />
        <KpiCard 
          title="Total Dépensé" 
          value={`${stats.payments?.total || 0} DT`}
        />
        <KpiCard 
          title="Activités" 
          value={stats.activities?.total || 0}
        />
        <KpiCard 
          title="Événements" 
          value={stats.activities?.events || 0}
        />
        <KpiCard 
          title="Publications" 
          value={stats.activities?.posts || 0}
        />
        <KpiCard 
          title="Publicités" 
          value={stats.activities?.ads || 0}
        />
      </div>

      <div className="charts">
      <ChartErrorBoundary>
          <div className="chart-container">
            <h3>Paiements Mensuels</h3>
            <LineChart 
              data={paymentsChartData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => `${value} DT`
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: context => `${context.dataset.label}: ${context.parsed.y} DT`
                    }
                  }
                }
              }}
            />
          </div>
        </ChartErrorBoundary>

        <ChartErrorBoundary>
          <div className="chart-container">
            <h3>Revenus Mensuels</h3>
            <LineChart data={revenueChartData} />
          </div>
        </ChartErrorBoundary>

        <ChartErrorBoundary>
          <div className="chart-container">
            <h3>Réservations par Activité</h3>
            <BarChart data={reservationsChartData} />
          </div>
        </ChartErrorBoundary>
      </div>
    </div>
  );
};

export default DashboardEn;