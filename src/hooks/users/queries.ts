import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUsers, User } from "@/services/userService";

export const useUsersQueryBase = (options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
    ...options,
  });
};
