'use client';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DateRangeSelector({
  startDate,
  endDate,
}: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-maroon/70">
      <span>Showing data from</span>
      <span className="font-medium text-maroon">{formatDate(startDate)}</span>
      <span>to</span>
      <span className="font-medium text-maroon">{formatDate(endDate)}</span>
    </div>
  );
}
