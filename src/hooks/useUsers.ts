import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, deleteUser, User } from "@/services/userService";

export const useUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useCreateUserMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteUserMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
