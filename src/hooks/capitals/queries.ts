import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getCapitals, Capital } from "@/services/capitalService";

export const useCapitalsQueryBase = (options?: Omit<UseQueryOptions<Capital[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Capital[]>({
    queryKey: ["capitals"],
    queryFn: getCapitals,
    ...options,
  });
};
