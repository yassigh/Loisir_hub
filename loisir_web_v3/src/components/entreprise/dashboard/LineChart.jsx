import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
//v2.0
const LineChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...data.datasets[0].data) * 1.2,
        ticks: {
          maxTicksLimit: 5,
          callback: function(value) {
            return value + ' DT';
          }
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

  return <Line data={data} options={options} />;
};
//v1.0
// const LineChart = ({ data }) => {
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       y: {
//         beginAtZero: true,
//         suggestedMax: Math.max(...data.datasets[0].data) * 1.2, // 20% padding
//         ticks: {
//           stepSize: Math.ceil(Math.max(...data.datasets[0].data) / 10), // 10 steps
//           callback: function(value) {
//             return value + ' DT';
//           }
//         }
//       }
//     },
//     plugins: {
//       legend: {
//         position: 'top',
//       }
//     },
//     elements: {
//       line: {
//         tension: 0.4 // Makes the line smoother
//       }
//     },
//     height: 300 // Fixed height
//   };

//   return <Line data={data} options={options} />;
// };

export default LineChart;