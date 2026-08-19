import { buildMultipartBody, request, requestVoid } from "./client";
import {
  companyListSchema,
  companySchema,
  type Company,
  type CompanyFormValues,
} from "./schemas";

export async function getCompanies(): Promise<Company[]> {
  return request(companyListSchema, { url: "/companies", method: "GET" });
}

export async function getCompany(id: number): Promise<Company> {
  return request(companySchema, { url: `/companies/${id}`, method: "GET" });
}

export interface CompanyPayload extends CompanyFormValues {
  logo?: File | null;
}

export async function createCompany({
  logo,
  ...values
}: CompanyPayload): Promise<Company> {
  return request(companySchema, {
    url: "/companies",
    method: "POST",
    params: {
      name: values.name,
      code: values.code,
      ...(values.logoUrl ? { logoUrl: values.logoUrl } : {}),
    },
    data: buildMultipartBody("logo", logo),
  });
}

export async function updateCompany(
  id: number,
  { logo, ...values }: CompanyPayload
): Promise<Company> {
  return request(companySchema, {
    url: `/companies/${id}`,
    method: "PUT",
    params: {
      name: values.name,
      code: values.code,
      ...(values.logoUrl ? { logoUrl: values.logoUrl } : {}),
    },
    data: buildMultipartBody("logo", logo),
  });
}

export async function deleteCompany(id: number): Promise<void> {
  return requestVoid({ url: `/companies/${id}`, method: "DELETE" });
}
