import { useCallback, useEffect, useState } from "react";
export default function useAsync(fn, deps = []) {
  const [s, setS] = useState({ data: null, loading: true, error: null });
  const run = useCallback(() => {
    setS((x) => ({ ...x, loading: true, error: null }));
    return fn()
      .then((data) => setS({ data, loading: false, error: null }))
      .catch((e) => setS({ data: null, loading: false, error: e.message }));
  }, deps); // eslint-disable-line
  useEffect(() => {
    run();
  }, [run]);
  return { ...s, reload: run };
}
