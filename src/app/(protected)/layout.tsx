import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAuth();

  return <AppShell userName={user.name}>{children}</AppShell>;
}
