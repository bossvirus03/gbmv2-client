import { useQueryClient } from "@tanstack/react-query";
import { useUsersQueryBase } from "./users/queries";
import { useCreateUserMutationBase, useDeleteUserMutationBase } from "./users/mutations";
import { User } from "@/services/userService";

export const useUsersQuery = () => {
  return useUsersQueryBase();
};

export const useCreateUserMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useCreateUserMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteUserMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useDeleteUserMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
export type { User };


