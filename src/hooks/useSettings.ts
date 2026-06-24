import { useQueryClient } from "@tanstack/react-query";
import { useSettingsQueryBase } from "./settings/queries";
import { useUpdateSettingsMutationBase } from "./settings/mutations";
import { SystemSettings } from "@/services/settingService";

export const useSettingsQuery = () => {
  return useSettingsQueryBase();
};

export const useUpdateSettingsMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useUpdateSettingsMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
export type { SystemSettings };


