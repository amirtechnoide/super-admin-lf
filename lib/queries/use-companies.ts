"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompany,
  updateCompany,
  type CompanyPayload,
} from "@/lib/api/companies";
import type { Company } from "@/lib/api/schemas";
import { queryKeys } from "./keys";

export function useCompanies(
  options?: Partial<UseQueryOptions<Company[]>>
) {
  return useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: getCompanies,
    ...options,
  });
}

export function useCompany(id: number | null) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id ?? 0),
    queryFn: () => getCompany(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** Les articles portent l'entreprise en relation : leur cache doit suivre. */
function useCompanyInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.stats });
  };
}

export function useCreateCompany() {
  const invalidate = useCompanyInvalidation();
  return useMutation({
    mutationFn: (payload: CompanyPayload) => createCompany(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCompany() {
  const invalidate = useCompanyInvalidation();
  return useMutation({
    mutationFn: ({ id, ...payload }: CompanyPayload & { id: number }) =>
      updateCompany(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCompany() {
  const invalidate = useCompanyInvalidation();
  return useMutation({
    mutationFn: (id: number) => deleteCompany(id),
    onSuccess: invalidate,
  });
}
