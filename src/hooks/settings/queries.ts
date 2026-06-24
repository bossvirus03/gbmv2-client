import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getSettings, SystemSettings } from "@/services/settingService";

export const useSettingsQueryBase = (options?: Omit<UseQueryOptions<SystemSettings, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<SystemSettings>({
    queryKey: ["settings"],
    queryFn: getSettings,
    ...options,
  });
};
