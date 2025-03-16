import React, { useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import {
  getUsers,
  updateUser,
  deleteUser,
  getCities,
  getSubdistricts,
  getBranches,
} from "@/lib/data";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User as UserIcon, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);

  // State untuk menyimpan data lokasi
  const [citiesList, setCitiesList] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [subdistrictsList, setSubdistrictsList] = useState<
    Array<{
      id: string;
      name: string;
      city_id: string;
      cities: { name: string };
    }>
  >([]);
  const [branchesList, setBranchesList] = useState<
    Array<{
      id: string;
      name: string;
      subdistrict_id: string;
      subdistricts: {
        name: string;
        cities: { name: string };
      };
    }>
  >([]);

  // Fungsi untuk memuat data lokasi
  const loadLocationData = async () => {
    try {
      const [cities, subdistricts, branches] = await Promise.all([
        getCities(),
        getSubdistricts(),
        getBranches(),
      ]);
      setCitiesList(cities);
      setSubdistrictsList(subdistricts);
      setBranchesList(branches);
    } catch (error) {
      toast.error("Gagal memuat data lokasi");
    }
  };

  // Redirect jika bukan super admin
  useEffect(() => {
    if (user && user.role !== "super_admin") {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadData() {
      try {
        const users = await getUsers();
        setUsersList(users);
        await loadLocationData();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Gagal memuat data pengguna");
        }
        navigate("/");
      }
    }
    loadData();
  }, [navigate]);

  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    branch?: string;
    subdistrict?: string;
    city?: string;
  }>({
    id: "",
    name: "",
    email: "",
    role: "branch_user",
    branch: "",
    subdistrict: "",
    city: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset field yang terkait saat mengubah kota atau wilayah
      if (field === "city") {
        newData.subdistrict = "";
        newData.branch = "";
      } else if (field === "subdistrict") {
        newData.branch = "";
      }

      return newData;
    });
  };

  // Fungsi untuk mendapatkan nama lokasi berdasarkan ID
  const getLocationName = (
    type: "city" | "subdistrict" | "branch",
    id: string
  ) => {
    switch (type) {
      case "city":
        return citiesList.find((city) => city.id === id)?.name || "";
      case "subdistrict":
        return subdistrictsList.find((sd) => sd.id === id)?.name || "";
      case "branch":
        return branchesList.find((branch) => branch.id === id)?.name || "";
      default:
        return "";
    }
  };

  // Filter subdistrict berdasarkan kota yang dipilih
  const getFilteredSubdistricts = (cityId: string) => {
    return subdistrictsList.filter((sd) => sd.city_id === cityId);
  };

  // Filter branch berdasarkan wilayah yang dipilih
  const getFilteredBranches = (subdistrictId: string) => {
    return branchesList.filter(
      (branch) => branch.subdistrict_id === subdistrictId
    );
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      id: `u${usersList.length + 1}`,
      name: "",
      email: "",
      role: "branch_user",
      branch: "",
      subdistrict: "",
      city: "",
    });
    setShowAddEditDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch || "",
      subdistrict: user.subdistrict || "",
      city: user.city || "",
    });
    setShowAddEditDialog(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.role) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    try {
      if (editingUser) {
        const updatedUser = await updateUser(editingUser.id, {
          name: formData.name,
          role: formData.role,
          branch: formData.branch
            ? getLocationName("branch", formData.branch)
            : undefined,
          subdistrict: formData.subdistrict
            ? getLocationName("subdistrict", formData.subdistrict)
            : undefined,
          city: formData.city
            ? getLocationName("city", formData.city)
            : undefined,
        });
        setUsersList((prev) =>
          prev.map((user) => (user.id === editingUser.id ? updatedUser : user))
        );
        toast.success("Data pengguna berhasil diperbarui");
      } else {
        // Untuk pengguna baru
        setUsersList((prev) => [...prev, formData]);
        toast.success("Pengguna baru berhasil ditambahkan");
      }
      setShowAddEditDialog(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          `Gagal ${editingUser ? "memperbarui" : "menambahkan"} pengguna`
        );
      }
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUsersList(usersList.filter((user) => user.id !== userToDelete.id));
        toast.success("Pengguna berhasil dihapus");
        setShowDeleteDialog(false);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Gagal menghapus pengguna");
        }
      }
    }
  };

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

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Akun</h1>
          {/* <Button onClick={handleAddUser} className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Tambah Akun
          </Button> */}
        </div>

        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleDisplay(user.role)}</TableCell>
                  <TableCell>
                    {user.branch && <div>Cabang: {user.branch}</div>}
                    {user.subdistrict && <div>Wilayah: {user.subdistrict}</div>}
                    {user.city && <div>Kota: {user.city}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditUser(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus pengguna {userToDelete?.name} secara
                permanen. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={showAddEditDialog}
          onOpenChange={setShowAddEditDialog}
        >
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nama
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nama Lengkap"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={editingUser !== null}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Jabatan
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch_user">User Cabang</SelectItem>
                    <SelectItem value="subdistrict_admin">
                      Admin Wilayah
                    </SelectItem>
                    <SelectItem value="city_admin">Admin Kota</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "branch_user" && (
                <>
                  <div className="grid gap-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      Kota
                    </label>
                    <Select
                      value={formData.city || ""}
                      onValueChange={(value) =>
                        handleSelectChange("city", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kota" />
                      </SelectTrigger>
                      <SelectContent>
                        {citiesList.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="subdistrict"
                      className="text-sm font-medium"
                    >
                      Wilayah
                    </label>
                    <Select
                      value={formData.subdistrict || ""}
                      onValueChange={(value) =>
                        handleSelectChange("subdistrict", value)
                      }
                      disabled={!formData.city}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wilayah" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.city &&
                          getFilteredSubdistricts(formData.city).map(
                            (subdistrict) => (
                              <SelectItem
                                key={subdistrict.id}
                                value={subdistrict.id}
                              >
                                {subdistrict.name}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="branch" className="text-sm font-medium">
                      Cabang
                    </label>
                    <Select
                      value={formData.branch || ""}
                      onValueChange={(value) =>
                        handleSelectChange("branch", value)
                      }
                      disabled={!formData.subdistrict}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.subdistrict &&
                          getFilteredBranches(formData.subdistrict).map(
                            (branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.role === "subdistrict_admin" && (
                <>
                  <div className="grid gap-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      Kota
                    </label>
                    <Select
                      value={formData.city || ""}
                      onValueChange={(value) =>
                        handleSelectChange("city", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kota" />
                      </SelectTrigger>
                      <SelectContent>
                        {citiesList.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="subdistrict"
                      className="text-sm font-medium"
                    >
                      Wilayah
                    </label>
                    <Select
                      value={formData.subdistrict || ""}
                      onValueChange={(value) =>
                        handleSelectChange("subdistrict", value)
                      }
                      disabled={!formData.city}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wilayah" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.city &&
                          getFilteredSubdistricts(formData.city).map(
                            (subdistrict) => (
                              <SelectItem
                                key={subdistrict.id}
                                value={subdistrict.id}
                              >
                                {subdistrict.name}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.role === "city_admin" && (
                <div className="grid gap-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    Kota
                  </label>
                  <Select
                    value={formData.city || ""}
                    onValueChange={(value) => handleSelectChange("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kota" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesList.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveUser}>
                Simpan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
