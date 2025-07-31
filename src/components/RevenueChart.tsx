import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { TimeEntry } from '@/services/timeService';
import { Project } from '@/services/projectService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RevenueChartProps {
  entries: TimeEntry[];
  projects: Project[];
}

export default function RevenueChart({ entries, projects }: RevenueChartProps) {
  const monthlyTotals: { [key: string]: number } = {};

  entries.forEach((entry) => {
    const project = projects.find((p) => p.id === entry.project_id);
    if (!project || !project.hourly_rate) return;

    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // e.g., 2025-07
    const revenue = entry.hours * project.hourly_rate;

    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + revenue;
  });

  const sortedKeys = Object.keys(monthlyTotals).sort();
  
  // Format month labels for better readability
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
  };

  const chartData = {
    labels: sortedKeys.map(formatMonthLabel),
    datasets: [
      {
        label: 'Revenue ($)',
        data: sortedKeys.map((key) => monthlyTotals[key]),
        backgroundColor: '#16a34a', // Using SIS green color
        borderColor: '#15803d',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: { 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        callbacks: { 
          label: (ctx) => `Revenue: $${ctx.raw?.toString() ? Number(ctx.raw).toFixed(2) : '0.00'}` 
        } 
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: { 
          callback: function(tickValue) {
            return `$${Number(tickValue).toLocaleString()}`;
          },
          color: '#6b7280',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#f3f4f6',
        }
      },
      x: { 
        ticks: { 
          maxRotation: 45, 
          minRotation: 45,
          color: '#6b7280',
          font: {
            size: 12
          }
        },
        grid: {
          display: false,
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}