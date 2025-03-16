import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAttempted, setLoginAttempted] = useState(false);
  const { user, login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempted(true);

    if (!email || !password) return;

    try {
      await login(email, password);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Demo logins dengan password yang sesuai di Supabase
  const demoLogins = [
    {
      role: "Branch User",
      email: "branch1@bolabolaayam.com",
      password: "branch1",
    },
    {
      role: "Sub-District Admin",
      email: "subdistrict@bolabolaayam.com",
      password: "subdistrict",
    },
    {
      role: "City Admin",
      email: "city@bolabolaayam.com",
      password: "city",
    },
  ];

  const setDemoLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-primary">Bola Bola Ayam</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sales Report Management
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={loginAttempted && !email ? "border-red-500" : ""}
                />
              </div>
              {loginAttempted && !email && (
                <p className="mt-1 text-sm text-red-600">Email is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={
                    loginAttempted && !password ? "border-red-500" : ""
                  }
                />
              </div>
              {loginAttempted && !password && (
                <p className="mt-1 text-sm text-red-600">
                  Password is required
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full button-transition button-hover"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
                    in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-2 text-sm text-red-600 text-center">{error}</div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {demoLogins.map((demoLogin) => (
                <Button
                  key={demoLogin.email}
                  variant="outline"
                  type="button"
                  className="button-transition"
                  onClick={() =>
                    setDemoLogin(demoLogin.email, demoLogin.password)
                  }
                >
                  Login as {demoLogin.role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
