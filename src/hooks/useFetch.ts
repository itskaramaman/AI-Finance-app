import { useState } from "react";

const useFetch = (cb) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>();
  const [data, setData] = useState();

  const fn = async (...args: unknown[]) => {
    try {
      setLoading(true);
      const result = await cb(...args);
      setData(result);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, error, fn };
};

export default useFetch;
