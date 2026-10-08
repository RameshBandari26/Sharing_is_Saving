import { lazy, Suspense } from "react";
const JourneyMap = lazy(() => import("./JourneyMap"));
export default function LazyMap(p) {
  return (
    <Suspense
      fallback={
        <div className="h-[300px] animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      }
    >
      <JourneyMap {...p} />
    </Suspense>
  );
}
