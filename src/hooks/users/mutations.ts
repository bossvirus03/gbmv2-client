import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createUser, deleteUser, User } from "@/services/userService";

export const useCreateUserMutationBase = (
  options?: UseMutationOptions<User, Error, { email: string }>
) => {
  return useMutation({
    mutationFn: (data) => createUser(data),
    ...options,
  });
};

export const useDeleteUserMutationBase = (
  options?: UseMutationOptions<any, Error, number | string>
) => {
  return useMutation({
    mutationFn: (id) => deleteUser(id),
    ...options,
  });
};
