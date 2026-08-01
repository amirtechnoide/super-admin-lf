import type { Admin } from "@/lib/types";
import { clone, db, sleep } from "./db";

export async function getAdmin(): Promise<Admin> {
  await sleep(200);
  return clone(db.admin);
}

export async function updateAdmin(data: Partial<Admin>): Promise<Admin> {
  await sleep(400);
  db.admin = { ...db.admin, ...data, id: db.admin.id };
  return clone(db.admin);
}

/** UI seule : aucune authentification réelle n'est effectuée. */
export async function signIn(email: string): Promise<Admin> {
  await sleep(600);
  return clone({ ...db.admin, email: email || db.admin.email });
}
