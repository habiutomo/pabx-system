import { useState, useEffect } from 'react';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

type ChartPeriod = 'daily' | 'weekly' | 'monthly';

interface CallChartProps {
  startDate: Date;
  endDate: Date;
}

export default function CallChart({ startDate, endDate }: CallChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>('daily');
  
  // Calculate the query period based on the selected period
  const getFormattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formattedStartDate = getFormattedDate(startDate);
  const formattedEndDate = getFormattedDate(endDate);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/stats/daily-volume', formattedStartDate, formattedEndDate],
    queryFn: () => 
      fetch(`/api/stats/daily-volume?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
        .then(res => res.json()),
    enabled: !!startDate && !!endDate
  });

  // Format data for the chart based on the period
  const formatChartData = (volumeData: Array<{date: string, count: number}> | undefined, period: ChartPeriod) => {
    if (!volumeData) return [];
    
    if (period === 'daily') {
      return volumeData.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        calls: item.count,
        date: item.date
      }));
    }
    
    if (period === 'weekly') {
      // Group by week
      const weeklyData: Record<string, { calls: number, count: number }> = {};
      
      volumeData.forEach(item => {
        const date = new Date(item.date);
        const weekNumber = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const weekKey = `Week ${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { calls: 0, count: 0 };
        }
        
        weeklyData[weekKey].calls += item.count;
        weeklyData[weekKey].count += 1;
      });
      
      return Object.entries(weeklyData).map(([name, data]) => ({
        name,
        calls: Math.round(data.calls / data.count),
        date: name
      }));
    }
    
    if (period === 'monthly') {
      // Group by month
      const monthlyData: Record<string, { calls: number, count: number }> = {};
      
      volumeData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { calls: 0, count: 0 };
        }
        
        monthlyData[monthKey].calls += item.count;
        monthlyData[monthKey].count += 1;
      });
      
      return Object.entries(monthlyData).map(([name, data]) => ({
        name,
        calls: Math.round(data.calls / data.count),
        date: name
      }));
    }
    
    return [];
  };
  
  const chartData = formatChartData(data, period);
  
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-neutral-700">Call Volume Trend</h3>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={period === 'daily' ? 'default' : 'outline'} 
              onClick={() => setPeriod('daily')}
              className="text-xs"
            >
              Daily
            </Button>
            <Button 
              size="sm" 
              variant={period === 'weekly' ? 'default' : 'outline'} 
              onClick={() => setPeriod('weekly')}
              className="text-xs"
            >
              Weekly
            </Button>
            <Button 
              size="sm" 
              variant={period === 'monthly' ? 'default' : 'outline'} 
              onClick={() => setPeriod('monthly')}
              className="text-xs"
            >
              Monthly
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4 h-64">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-neutral-500">Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#0078D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
