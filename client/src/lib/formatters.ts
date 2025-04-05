export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ].join(':');
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function formatCallType(type: string): { label: string, className: string } {
  switch (type) {
    case 'internal':
      return { 
        label: 'Internal', 
        className: 'bg-[#107C10]/20 text-[#107C10]' 
      };
    case 'local':
      return { 
        label: 'Lokal', 
        className: 'bg-[#0078D4]/20 text-[#0078D4]' 
      };
    case 'long-distance':
      return { 
        label: 'Jarak Jauh', 
        className: 'bg-[#FFB900]/20 text-[#FFB900]' 
      };
    case 'international':
      return { 
        label: 'Internasional', 
        className: 'bg-[#A80000]/20 text-[#A80000]' 
      };
    default:
      return { 
        label: type, 
        className: 'bg-neutral-200 text-neutral-700' 
      };
  }
}

export function formatNumberWithCommas(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatHoursMinutes(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}j ${minutes}m`;
}

export function formatPercentChange(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function shortenNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
