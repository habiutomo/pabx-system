import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Eye, Download, Search } from 'lucide-react';
import { formatDuration, formatDateTime, formatCallType } from '@/lib/formatters';
import { Call } from '@shared/schema';

interface CallTableProps {
  startDate: Date;
  endDate: Date;
}

export default function CallTable({ startDate, endDate }: CallTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Format dates for the API
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  // Fetch calls with pagination
  const { data, isLoading } = useQuery<{ calls: Call[], total: number }>({
    queryKey: ['/api/calls', formattedStartDate, formattedEndDate, currentPage, pageSize, searchTerm],
    queryFn: async () => {
      const offset = (currentPage - 1) * pageSize;
      const queryParams = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        limit: pageSize.toString(),
        offset: offset.toString()
      });
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/calls?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }
      return response.json();
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Searching will reset pagination
    setCurrentPage(1);
  };
  
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export calls to CSV');
  };
  
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-semibold text-neutral-700">Panggilan Terbaru</h3>
        
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="relative mr-4">
            <Input
              type="text"
              placeholder="Cari panggilan..."
              className="pl-9 pr-4 py-2 rounded-md bg-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </form>
          
          <Button onClick={handleExport} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              <TableHead>Tanggal & Waktu</TableHead>
              <TableHead>Sumber</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Biaya</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Memuat panggilan...
                </TableCell>
              </TableRow>
            ) : data && data.calls.length > 0 ? (
              data.calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>{formatDateTime(call.timestamp)}</TableCell>
                  <TableCell>{call.sourceExtension} {call.sourceDepartment ? `(${call.sourceDepartment})` : ''}</TableCell>
                  <TableCell>{call.destinationNumber}</TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-block ${formatCallType(call.callType).className}`}>
                      {formatCallType(call.callType).label}
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(call.duration)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(Number(call.cost))}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark" title="Lihat Detail">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Tidak ditemukan panggilan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {data && data.total > 0 && (
        <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            Menampilkan <span className="font-medium">{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.total)}</span> dari <span className="font-medium">{data.total}</span> panggilan
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
