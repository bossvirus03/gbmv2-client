import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCapitals, createCapital, updateCapital, deleteCapital, Capital } from "@/services/capitalService";

export const useCapitalsQuery = () => {
  return useQuery<Capital[]>({
    queryKey: ["capitals"],
    queryFn: getCapitals,
  });
};

export const useCreateCapitalMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; date?: string; content: string }) => createCapital(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitals"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateCapitalMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; amount?: number; date?: string; content?: string }) =>
      updateCapital(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitals"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteCapitalMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCapital(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitals"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
