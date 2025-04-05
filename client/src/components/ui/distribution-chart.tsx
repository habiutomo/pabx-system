import { PieChart, ResponsiveContainer, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface DistributionChartProps {
  startDate: Date;
  endDate: Date;
}

const COLORS = ['#0078D4', '#A80000', '#FFB900', '#107C10'];

export default function DistributionChart({ startDate, endDate }: DistributionChartProps) {
  const getFormattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formattedStartDate = getFormattedDate(startDate);
  const formattedEndDate = getFormattedDate(endDate);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/stats/calls', formattedStartDate, formattedEndDate],
    enabled: !!startDate && !!endDate
  });
  
  const formatChartData = (statsData: any) => {
    if (!statsData || !statsData.callsByType) return [];
    
    const total = statsData.totalCalls;
    return [
      {
        name: 'Local Calls',
        value: statsData.callsByType.local,
        percentage: Math.round((statsData.callsByType.local / total) * 100),
        color: COLORS[0]
      },
      {
        name: 'Long Distance',
        value: statsData.callsByType['long-distance'],
        percentage: Math.round((statsData.callsByType['long-distance'] / total) * 100),
        color: COLORS[1]
      },
      {
        name: 'International',
        value: statsData.callsByType.international,
        percentage: Math.round((statsData.callsByType.international / total) * 100),
        color: COLORS[2]
      },
      {
        name: 'Internal',
        value: statsData.callsByType.internal,
        percentage: Math.round((statsData.callsByType.internal / total) * 100),
        color: COLORS[3]
      }
    ];
  };
  
  const chartData = formatChartData(data);
  
  // Custom legend rendering
  const renderLegend = () => {
    return (
      <div className="flex flex-col space-y-3 md:ml-8">
        {chartData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-sm mr-2" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm">{entry.name} ({entry.percentage}%)</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-700">Call Types Distribution</h3>
      </div>
      
      <div className="p-4 flex flex-col md:flex-row items-center">
        {isLoading ? (
          <div className="h-48 w-full flex items-center justify-center">
            <p className="text-neutral-500">Loading chart data...</p>
          </div>
        ) : (
          <>
            <div className="w-48 h-48 relative mb-4 md:mb-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {renderLegend()}
          </>
        )}
      </div>
    </div>
  );
}
