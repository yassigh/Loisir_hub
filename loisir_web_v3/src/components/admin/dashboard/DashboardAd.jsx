// // src/components/Dashboard/index.js
// import React from 'react';
// import KpiCard from './KpiCard';
// import LineChart from './LineChart';
// import BarChart from './BarChart';
// import '../../../styles/dashboard.css';


// const Dashboard = () => {
//   const [stats, setStats] = React.useState({
//     totalUsers: 0,
//     totalEnterprises: 0,
//     totalActivities: 0,
//     totalReservations: 0,
//     totalEvents: 0,
//     totalPosts: 0,
//     totalAds: 0,
//     revenue: {
//       adsRevenue: 0,
//       reservationsRevenue: 0,
//     },
//     revenueData: [],
//     activityStats: [],
//     subscriptionData: [],
//     adData: [],
//   });

//   // Simuler la récupération des données depuis l'API
//   React.useEffect(() => {
//     fetch('/api/dashboard-stats')
//       .then((response) => response.json())
//       .then((data) => setStats(data))
//       .catch((error) => console.error('Failed to fetch data:', error));
//   }, []);

//   return (
//     <div className="dashboard">
//       {/* Section des KPI Cards */}
//       <div className="kpi-cards">
//         <KpiCard title="Utilisateurs" value={stats.totalUsers} />
//         <KpiCard title="Entreprises" value={stats.totalEnterprises} />
//         <KpiCard title="Réservations" value={stats.totalReservations} />
//         <KpiCard title="Revenu" value={stats.revenue.adsRevenue + stats.revenue.reservationsRevenue} />
//         <KpiCard title="Activités" value={stats.totalActivities} />
//         <KpiCard title="Événements" value={stats.totalEvents} />
//         <KpiCard title="Publications" value={stats.totalPosts} />
//         <KpiCard title="Publicités" value={stats.totalAds} />
//       </div>

//       {/* Section des Graphiques */}
//       <div className="charts">
//         <div className="chart-container">
//           <h3>Abonnements par mois</h3>
//           <LineChart data={stats.subscriptionData} />
//         </div>
//         <div className="chart-container">
//           <h3>Montant de la publicité par mois</h3>
//           <LineChart data={stats.adData} />
//         </div>
//         <div className="chart-container">
//           <h3>Réservations par rapport aux activités</h3>
//           <BarChart data={stats.activityStats} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import KpiCard from './KpiCard';
// import LineChart from './LineChart';
// import BarChart from './BarChart';
// import { adminStatsService } from '../../../services/AdminStatsService';
// import '../../../styles/dashboard.css';

// const Dashboard = () => {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const data = await adminStatsService.getDashboardStats();
//         setStats(data);
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   if (loading || !stats) return <div>Loading...</div>;

//   // Préparer les données pour les graphiques
//   const subscriptionData = stats.monthlyStats.subscriptions.map(item => ({
//     month: item.month,
//     value: item.total
//   }));

//   const publiciteData = stats.monthlyStats.publicites.map(item => ({
//     month: item.month,
//     value: item.total
//   }));

//   const reservationData = stats.reservations.byActivity.map(item => ({
//     name: item.titre,
//     value: item.total_reservations
//   }));

//   return (
//     <div className="dashboard">
//       {/* KPI Cards Section */}
//       <div className="kpi-cards">
//         <KpiCard title="Utilisateurs" value={stats.users.total} />
//         <KpiCard title="Entreprises" value={stats.entreprises.total} />
//         <KpiCard title="Réservations" value={stats.reservations.total} />
//         <KpiCard title="Revenu Total" value={`${stats.revenue.total} DT`} />
//         <KpiCard title="Activités" value={stats.activities.total} />
//         <KpiCard title="Événements" value={stats.activities.events} />
//         <KpiCard title="Publications" value={stats.activities.posts} />
//         <KpiCard title="Publicités" value={stats.activities.ads} />
//       </div>

//       {/* Charts Section */}
//       <div className="charts">
//         <div className="chart-container">
//           <h3>Revenus des Abonnements par Mois</h3>
//           <LineChart 
//             data={subscriptionData}
//             xKey="month"
//             yKey="value"
//             color="#4CAF50"
//           />
//         </div>
//         <div className="chart-container">
//           <h3>Revenus des Publicités par Mois</h3>
//           <LineChart 
//             data={publiciteData}
//             xKey="month"
//             yKey="value"
//             color="#2196F3"
//           />
//         </div>
//         <div className="chart-container">
//           <h3>Réservations par Activité</h3>
//           <BarChart 
//             data={reservationData}
//             xKey="name"
//             yKey="value"
//             color="#FF9800"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState, useRef } from 'react';
import KpiCard from './KpiCard';
import LineChart from './LineChart';
import BarChart from './BarChart';
import { adminStatsService } from '../../../services/AdminStatsService';
import ChartErrorBoundary from './ChartErrorBoundary';
import '../../../styles/dashboard.css';

const DashboardAd = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartInstancesRef = useRef([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminStatsService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Cleanup function
    return () => {
      chartInstancesRef.current.forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  if (loading || !stats) return <div>Loading...</div>;

  // Format data for charts
  const subscriptionChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenus Abonnements',
      data: stats?.monthlyStats?.subscriptions?.map(item => item.total) || Array(12).fill(0),
      borderColor: '#4CAF50',
      fill: false
    }]
  };

  const publiciteChartData = {
    labels: stats.monthlyStats?.publicites?.map(item => item.month) || [],
    datasets: [{
      label: 'Revenus Publicités',
      data: stats.monthlyStats?.publicites?.map(item => item.total) || [],
      borderColor: '#2196F3',
      fill: false
    }]
  };

  const reservationChartData = {
    labels: stats.reservations?.byActivity?.map(item => item.titre) || [],
    datasets: [{
      label: 'Réservations par Activité',
      data: stats.reservations?.byActivity?.map(item => item.total_reservations) || [],
      backgroundColor: '#FF9800'
    }]
  };

  return (
    <div className="dashboard">
      <div className="kpi-cards">
        <KpiCard title="Utilisateurs" value={stats.users?.total || 0} />
        <KpiCard title="Entreprises" value={stats.entreprises?.total || 0} />
        <KpiCard title="Réservations" value={stats.reservations?.total || 0} />
        <KpiCard title="Revenu Total" value={`${stats.revenue?.total || 0} DT`} />
        <KpiCard title="Activités" value={stats.activities?.total || 0} />
        <KpiCard title="Événements" value={stats.activities?.events || 0} />
        <KpiCard title="Publications" value={stats.activities?.posts || 0} />
        <KpiCard title="Publicités" value={stats.activities?.ads || 0} />
      </div>

      <div className="charts">
        <ChartErrorBoundary>
          <div className="chart-container">
            <h3>Revenus des Abonnements par Mois</h3>
            <LineChart data={subscriptionChartData} />
          </div>
        </ChartErrorBoundary>

        <ChartErrorBoundary>
          <div className="chart-container">
            <h3>Revenus des Publicités par Mois</h3>
            <LineChart data={publiciteChartData} />
          </div>
        </ChartErrorBoundary>

        <ChartErrorBoundary>
          <div className="chart-container">
            <h3>Réservations par Activité</h3>
            <BarChart data={reservationChartData} />
          </div>
        </ChartErrorBoundary>
      </div>
    </div>
  );
};

export default DashboardAd;