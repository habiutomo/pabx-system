import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BarChart2, FileText } from 'lucide-react';
import { CallType } from '@shared/schema';

interface DepartmentTableProps {
  startDate: Date;
  endDate: Date;
  onGenerateInvoices: () => void;
}

interface DepartmentStat {
  department: string;
  totalCalls: number;
  callsByType: {
    [key in CallType | 'long-distance']: {
      count: number;
      cost: number;
    }
  };
  totalCost: number;
}

export default function DepartmentTable({ startDate, endDate, onGenerateInvoices }: DepartmentTableProps) {
  // Format dates for the API
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  const { data, isLoading } = useQuery<DepartmentStat[]>({
    queryKey: ['/api/stats/departments', formattedStartDate, formattedEndDate],
    enabled: !!startDate && !!endDate
  });
  
  // Calculate totals for the footer
  const calculateTotals = () => {
    if (!data) return null;
    
    const totals = {
      totalCalls: 0,
      local: { count: 0, cost: 0 },
      longDistance: { count: 0, cost: 0 },
      international: { count: 0, cost: 0 },
      totalCost: 0
    };
    
    data.forEach((dept: DepartmentStat) => {
      totals.totalCalls += dept.totalCalls;
      totals.local.count += dept.callsByType.local.count;
      totals.local.cost += dept.callsByType.local.cost;
      totals.longDistance.count += dept.callsByType['long-distance'].count;
      totals.longDistance.cost += dept.callsByType['long-distance'].cost;
      totals.international.count += dept.callsByType.international.count;
      totals.international.cost += dept.callsByType.international.cost;
      totals.totalCost += dept.totalCost;
    });
    
    return totals;
  };
  
  const totals = calculateTotals();
  
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-semibold text-neutral-700">Ringkasan Penagihan Departemen</h3>
        
        <Button 
          variant="outline" 
          onClick={onGenerateInvoices}
          className="border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4] hover:text-white transition-colors"
        >
          <FileText className="mr-2 h-4 w-4" />
          Buat Faktur
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              <TableHead>Departemen</TableHead>
              <TableHead>Total Panggilan</TableHead>
              <TableHead>Lokal</TableHead>
              <TableHead>Jarak Jauh</TableHead>
              <TableHead>Internasional</TableHead>
              <TableHead>Total Biaya</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Memuat data departemen...
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              data.map((dept: DepartmentStat, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell>{dept.totalCalls}</TableCell>
                  <TableCell>{dept.callsByType.local.count} ({new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(dept.callsByType.local.cost)})</TableCell>
                  <TableCell>{dept.callsByType['long-distance'].count} ({new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(dept.callsByType['long-distance'].cost)})</TableCell>
                  <TableCell>{dept.callsByType.international.count} ({new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(dept.callsByType.international.cost)})</TableCell>
                  <TableCell className="font-medium">{new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(dept.totalCost)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="text-[#0078D4] hover:text-[#106EBE]" title="Lihat Detail">
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800" title="Unduh PDF">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Tidak ditemukan data departemen
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {totals && (
            <TableFooter className="bg-neutral-100 font-semibold">
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>{totals.totalCalls}</TableCell>
                <TableCell>{totals.local.count} ({new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totals.local.cost)})</TableCell>
                <TableCell>{totals.longDistance.count} ({new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totals.longDistance.cost)})</TableCell>
                <TableCell>{totals.international.count} ({new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totals.international.cost)})</TableCell>
                <TableCell>{new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totals.totalCost)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}
