import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
      <div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
    </div>
  );
}
