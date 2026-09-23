// filepath: /c:/Users/Yassine/Desktop/test/loisir_web_v3/src/components/admin/dashboard/BarChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
//v2.0
const BarChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...data.datasets[0].data) * 1.2,
        ticks: {
          maxTicksLimit: 5
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20
      }
    },
    aspectRatio: 2
  };

  return <Bar data={data} options={options} />;
};
//v1.0
// const BarChart = ({ data }) => {
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       y: {
//         beginAtZero: true,
//         suggestedMax: Math.max(...data.datasets[0].data) * 1.2, // 20% padding
//         ticks: {
//           stepSize: Math.ceil(Math.max(...data.datasets[0].data) / 5) // 5 steps
//         }
//       }
//     },
//     plugins: {
//       legend: {
//         position: 'top',
//       }
//     },
//     height: 300 // Fixed height
//   };

//   return <Bar data={data} options={options} />;
// };

export default BarChart;