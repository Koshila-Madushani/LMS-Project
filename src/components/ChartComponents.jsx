import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// ඔක්කොම Modules Register කරන්න
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend, 
  ChartDataLabels
);

export default function ChartComponent({ type }) {
  
  const teacherData = {
    labels: ['Mr. Silva', 'Ms. Perera', 'Mr. Fernado', 'Ms. Jayasurya', 'Mr. Kumar'],
    datasets: [{
      label: 'Performance',
      data: [4.5, 4.1, 3.5, 3.2, 2.8],
      backgroundColor: '#3b82f6',
    }]
  };

  const classData = {
    labels: ['Math', 'Science', 'English', 'History', 'IT'],
    datasets: [{
      data: [30, 25, 15, 20, 10],
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'],
    }]
  };

  return (
    <>
      {type === 'bar' ? (
  <Bar 
    data={teacherData} 
    options={{ 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: false // මෙන්න මේකෙන් බාර් චාට් එකේ ඉලක්කම් මැකිලා යනවා
        }
      }
    }} 
  />
) : (
        <Pie 
          data={classData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right' },
              tooltip: { enabled: false }, // මවුස් එක තියද්දී මොකුත් පෙන්වන්නේ නැහැ
              datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 14 },
                formatter: (value, ctx) => {
                  let sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  return ((value * 100) / sum).toFixed(0) + "%"; // ප්‍රතිශතය විතරක් පෙන්වයි
                }
              }
            }
          }} 
        />
      )}
    </>
  );
}