import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { updateSettings, SystemSettings } from "@/services/settingService";

export const useUpdateSettingsMutationBase = (
  options?: UseMutationOptions<
    SystemSettings,
    Error,
    {
      shippingVnPerKg?: number;
      exchangeRate?: number;
      domesticShippingJpy?: number;
      serviceFeeRate?: number;
    }
  >
) => {
  return useMutation({
    mutationFn: (data) => updateSettings(data),
    ...options,
  });
};
