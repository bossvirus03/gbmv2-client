import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, SystemSettings } from "@/services/settingService";

export const useSettingsQuery = () => {
  return useQuery<SystemSettings>({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
};

export const useUpdateSettingsMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      shippingVnPerKg?: number;
      exchangeRate?: number;
      domesticShippingJpy?: number;
      serviceFeeRate?: number;
    }) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
