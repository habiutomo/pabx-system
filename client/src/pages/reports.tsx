import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DownloadCloud, 
  FileText,
  BarChart2,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import DateRangeSelector from '@/components/ui/date-range-selector';
import { getDateRange } from '@/lib/utils';
import CallChart from '@/components/ui/call-chart';
import DistributionChart from '@/components/ui/distribution-chart';

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState('call-volume');
  const [activeTab, setActiveTab] = useState('view');
  
  // Set initial date range
  useEffect(() => {
    const { startDate: start, endDate: end } = getDateRange(29); // Last 30 days
    setStartDate(start);
    setEndDate(end);
  }, []);
  
  // Handle date range changes
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  const { data: reportTemplates } = useQuery({
    queryKey: ['/api/report-templates']
  });
  
  const handleExport = (format: 'pdf' | 'csv') => {
    toast({
      title: `Exporting Report as ${format.toUpperCase()}`,
      description: "Your report is being generated and will download shortly.",
      duration: 3000
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700 mb-4 sm:mb-0">Reports</h1>
        
        <DateRangeSelector 
          value={dateRange}
          onChange={setDateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="view">View Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader className="border-b border-neutral-200 px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-lg font-semibold">Generate Report</CardTitle>
                
                <div className="flex gap-2">
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call-volume">Call Volume Report</SelectItem>
                      <SelectItem value="department-costs">Department Costs Report</SelectItem>
                      <SelectItem value="call-types">Call Types Distribution</SelectItem>
                      <SelectItem value="hourly-activity">Hourly Activity Report</SelectItem>
                      <SelectItem value="user-activity">User Activity Report</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={() => handleExport('pdf')} variant="outline" className="flex items-center whitespace-nowrap">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  
                  <Button onClick={() => handleExport('csv')} className="flex items-center whitespace-nowrap">
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {reportType === 'call-volume' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-neutral-700">Call Volume Report</h2>
                  <p className="text-neutral-600">Analysis of call volume trends for the selected period.</p>
                  <CallChart startDate={startDate} endDate={endDate} />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-neutral-500 font-medium">Total Calls</div>
                          <div className="text-2xl font-semibold mt-1">3,742</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-neutral-500 font-medium">Average Daily Calls</div>
                          <div className="text-2xl font-semibold mt-1">124.7</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-neutral-500 font-medium">Peak Day</div>
                          <div className="text-2xl font-semibold mt-1">Friday (792 calls)</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
              
              {reportType === 'department-costs' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-neutral-700">Department Costs Report</h2>
                  <p className="text-neutral-600">Breakdown of call costs by department for the selected period.</p>
                  
                  <div className="h-[400px]">
                    {/* Department costs chart would go here */}
                    <div className="h-full w-full flex items-center justify-center bg-neutral-100 rounded-md">
                      <BarChart2 className="h-12 w-12 text-neutral-400" />
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader className="bg-neutral-100">
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Calls</TableHead>
                        <TableHead>Total Duration</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>% of Budget</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Department data would be mapped here */}
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Select a date range and generate the report to see department costs
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {reportType === 'call-types' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-neutral-700">Call Types Distribution</h2>
                  <p className="text-neutral-600">Analysis of call types for the selected period.</p>
                  <DistributionChart startDate={startDate} endDate={endDate} />
                </div>
              )}
              
              {reportType === 'hourly-activity' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-neutral-700">Hourly Activity Report</h2>
                  <p className="text-neutral-600">Call volume by hour of day for the selected period.</p>
                  
                  <div className="h-[400px]">
                    {/* Hourly activity chart would go here */}
                    <div className="h-full w-full flex items-center justify-center bg-neutral-100 rounded-md">
                      <LineChart className="h-12 w-12 text-neutral-400" />
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Peak Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-neutral-500 font-medium">Busiest Hour</div>
                          <div className="text-2xl font-semibold mt-1">10:00 - 11:00 AM</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-neutral-500 font-medium">Quietest Hour</div>
                          <div className="text-2xl font-semibold mt-1">3:00 - 4:00 AM</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-neutral-500 font-medium">Business Hours %</div>
                          <div className="text-2xl font-semibold mt-1">87.6%</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
              
              {reportType === 'user-activity' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-neutral-700">User Activity Report</h2>
                  <p className="text-neutral-600">Call activity by user for the selected period.</p>
                  
                  <div className="mt-4">
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="max-w-sm mb-4"
                    />
                    
                    <Table>
                      <TableHeader className="bg-neutral-100">
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Extension</TableHead>
                          <TableHead>Total Calls</TableHead>
                          <TableHead>Total Duration</TableHead>
                          <TableHead>Total Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* User data would be mapped here */}
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Select a date range and generate the report to see user activity
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="border-b border-neutral-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Saved Report Templates</CardTitle>
                <Button className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-100">
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportTemplates && reportTemplates.length > 0 ? (
                    reportTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.type}</TableCell>
                        <TableCell>User #{template.createdBy}</TableCell>
                        <TableCell>{template.isDefault ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="text-[#0078D4] hover:text-[#106EBE]" title="Run Report">
                              <BarChart2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800" title="Edit Template">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No saved report templates
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
