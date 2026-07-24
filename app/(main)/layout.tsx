"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/lib/auth-context";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl">
      <Sidebar />
      <main className="min-h-screen flex-1 border-r">{children}</main>
      <div className="hidden w-80 lg:block" />
    </div>
  );
}