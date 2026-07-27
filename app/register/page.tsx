"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nim: "",
    username: "",
    nama_lengkap: "",
    email_amikom: "",
    prodi: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Daftar UnguSpace</CardTitle>
          <CardDescription>Khusus mahasiswa Amikom Yogyakarta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                placeholder="23.01.1234"
                value={form.nim}
                onChange={handleChange("nim")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="dega_anjam"
                value={form.username}
                onChange={handleChange("username")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={form.nama_lengkap}
                onChange={handleChange("nama_lengkap")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email Amikom</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@student.amikom.ac.id"
                value={form.email_amikom}
                onChange={handleChange("email_amikom")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="prodi">Program Studi</Label>
              <Input
                id="prodi"
                placeholder="Informatika"
                value={form.prodi}
                onChange={handleChange("prodi")}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-primary underline">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}