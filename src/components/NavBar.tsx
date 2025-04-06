
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown, Users, Building } from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "branch_user":
        return "User Cabang";
      case "subdistrict_admin":
        return "Admin Wilayah";
      case "city_admin":
        return "Admin Kota";
      case "super_admin":
        return "Super Admin";
      default:
        return role;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/75 dark:bg-black/30 border-b border-b-slate-200 dark:border-b-slate-700 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              BBA Premium
            </span>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="button-transition flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 glass-panel animate-fadeIn"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {getRoleDisplay(user.role)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "super_admin" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center gap-2"
                      onClick={() => navigate("/admin/users")}
                    >
                      <Users className="h-4 w-4" />
                      <span>Manajemen Akun</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center gap-2"
                      onClick={() => navigate("/admin/locations")}
                    >
                      <Building className="h-4 w-4" />
                      <span>Manajemen Lokasi</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
