import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, MapPin, Landmark, Pencil, Plus, Trash } from "lucide-react";
import {
  getBranches,
  getSubdistricts,
  getCities,
  createBranch,
  updateBranch,
  deleteBranch,
  createSubdistrict,
  updateSubdistrict,
  deleteSubdistrict,
  createCity,
  updateCity,
  deleteCity,
  testSupabaseConnection,
} from "@/lib/data";
import { toast } from "sonner";

type Branch = {
  id: string;
  name: string;
  subdistrict_id: string;
  subdistricts: {
    name: string;
    cities: {
      name: string;
    };
  };
};

type Subdistrict = {
  id: string;
  name: string;
  city_id: string;
  cities: {
    name: string;
  };
};

type City = {
  id: string;
  name: string;
};

type BranchForm = {
  id: string;
  name: string;
  subdistrict_id: string;
};

type SubdistrictForm = {
  id: string;
  name: string;
  city_id: string;
};

export default function LocationManagement() {
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [subdistrictsList, setSubdistrictsList] = useState<Subdistrict[]>([]);
  const [citiesList, setCitiesList] = useState<City[]>([]);

  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showSubdistrictDialog, setShowSubdistrictDialog] = useState(false);
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingSubdistrict, setEditingSubdistrict] =
    useState<Subdistrict | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [newBranchName, setNewBranchName] = useState("");
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState("");
  const [newSubdistrictName, setNewSubdistrictName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Test koneksi Supabase
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.connected) {
          toast.error(`Gagal terhubung ke database: ${connectionTest.error}`);
          return;
        }
        if (!connectionTest.canWrite) {
          toast.error(`Tidak memiliki izin menulis: ${connectionTest.error}`);
        }

        const [branchesData, subdistrictsData, citiesData] = await Promise.all([
          getBranches(),
          getSubdistricts(),
          getCities(),
        ]);
        setBranchesList(branchesData);
        setSubdistrictsList(subdistrictsData);
        setCitiesList(citiesData);
      } catch (error) {
        console.error("Load data error:", error);
        toast.error("Gagal memuat data lokasi");
      }
    }
    loadData();
  }, []);

  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "branch" | "subdistrict" | "city";
  } | null>(null);

  const [branchForm, setBranchForm] = useState<BranchForm>({
    id: "",
    name: "",
    subdistrict_id: "",
  });

  const [subdistrictForm, setSubdistrictForm] = useState<SubdistrictForm>({
    id: "",
    name: "",
    city_id: "",
  });

  const [cityForm, setCityForm] = useState({
    id: "",
    name: "",
  });

  // Branch handlers
  const handleAddBranch = async () => {
    if (!newBranchName || !selectedSubdistrictId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const newBranch: Branch = {
        id: crypto.randomUUID(),
        name: newBranchName,
        subdistrict_id: selectedSubdistrictId,
        subdistricts: {
          name:
            subdistrictsList.find((sd) => sd.id === selectedSubdistrictId)
              ?.name || "",
          cities: {
            name:
              subdistrictsList.find((sd) => sd.id === selectedSubdistrictId)
                ?.cities.name || "",
          },
        },
      };

      setBranchesList((prev) => [...prev, newBranch]);
      setNewBranchName("");
      setSelectedSubdistrictId("");
      toast.success("Branch added successfully");
    } catch (error) {
      toast.error("Failed to add branch");
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      id: branch.id,
      name: branch.name,
      subdistrict_id: branch.subdistrict_id,
    });
    setShowBranchDialog(true);
  };

  const handleSaveBranch = async () => {
    if (!branchForm.name || !branchForm.subdistrict_id) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingBranch) {
        const updatedBranch = await updateBranch(editingBranch.id, branchForm);
        setBranchesList((prev) =>
          prev.map((b) => (b.id === editingBranch.id ? updatedBranch : b))
        );
        toast.success("Branch updated successfully");
      } else {
        const newBranch = await createBranch(branchForm);
        setBranchesList((prev) => [...prev, newBranch]);
        toast.success("Branch added successfully");
      }
      setShowBranchDialog(false);
    } catch (error) {
      toast.error(`Failed to ${editingBranch ? "update" : "add"} branch`);
    }
  };

  // Subdistrict handlers
  const handleAddSubdistrict = async () => {
    if (!newSubdistrictName || !selectedCityId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const newSubdistrict: Subdistrict = {
        id: crypto.randomUUID(),
        name: newSubdistrictName,
        city_id: selectedCityId,
        cities: {
          name: citiesList.find((c) => c.id === selectedCityId)?.name || "",
        },
      };

      setSubdistrictsList((prev) => [...prev, newSubdistrict]);
      setNewSubdistrictName("");
      setSelectedCityId("");
      toast.success("Subdistrict added successfully");
    } catch (error) {
      toast.error("Failed to add subdistrict");
    }
  };

  const handleEditSubdistrict = (subdistrict: Subdistrict) => {
    setEditingSubdistrict(subdistrict);
    setSubdistrictForm({
      id: subdistrict.id,
      name: subdistrict.name,
      city_id: subdistrict.city_id,
    });
    setShowSubdistrictDialog(true);
  };

  const handleSaveSubdistrict = async () => {
    if (!subdistrictForm.name || !subdistrictForm.city_id) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingSubdistrict) {
        const updatedSubdistrict = await updateSubdistrict(
          editingSubdistrict.id,
          subdistrictForm
        );
        setSubdistrictsList((prev) =>
          prev.map((sd) =>
            sd.id === editingSubdistrict.id ? updatedSubdistrict : sd
          )
        );
        toast.success("Subdistrict updated successfully");
      } else {
        const newSubdistrict = await createSubdistrict(subdistrictForm);
        setSubdistrictsList((prev) => [...prev, newSubdistrict]);
        toast.success("Subdistrict added successfully");
      }
      setShowSubdistrictDialog(false);
    } catch (error) {
      toast.error(
        `Failed to ${editingSubdistrict ? "update" : "add"} subdistrict`
      );
    }
  };

  // City handlers
  const handleAddCity = () => {
    setEditingCity(null);
    setCityForm({
      id: "",
      name: "",
    });
    setShowCityDialog(true);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityForm({ ...city });
    setShowCityDialog(true);
  };

  const handleSaveCity = async () => {
    if (!cityForm.name) {
      toast.error("Please enter a city name");
      return;
    }

    try {
      if (editingCity) {
        const updatedCity = await updateCity(editingCity.id, cityForm);
        setCitiesList((prev) =>
          prev.map((city) => (city.id === editingCity.id ? updatedCity : city))
        );
        toast.success("City updated successfully");
      } else {
        const newCity = await createCity(cityForm);
        setCitiesList((prev) => [...prev, newCity]);
        toast.success("City added successfully");
      }
      setShowCityDialog(false);
    } catch (error) {
      toast.error(`Failed to ${editingCity ? "update" : "add"} city`);
    }
  };

  // Delete handlers
  const handleDeleteClick = (
    id: string,
    type: "branch" | "subdistrict" | "city"
  ) => {
    setItemToDelete({ id, type });
    setShowDeleteDialog(true);
  };

  const getDeleteItemName = () => {
    if (!itemToDelete) return "";

    switch (itemToDelete.type) {
      case "branch":
        return branchesList.find((b) => b.id === itemToDelete.id)?.name || "";
      case "subdistrict":
        return (
          subdistrictsList.find((s) => s.id === itemToDelete.id)?.name || ""
        );
      case "city":
        return citiesList.find((c) => c.id === itemToDelete.id)?.name || "";
    }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case "branch":
          const branchToDelete = branchesList.find(
            (b) => b.id === itemToDelete.id
          );
          if (branchToDelete) {
            handleDeleteBranch(branchToDelete);
          }
          break;
        case "subdistrict":
          const subdistrictToDelete = subdistrictsList.find(
            (s) => s.id === itemToDelete.id
          );
          if (subdistrictToDelete) {
            handleDeleteSubdistrict(subdistrictToDelete);
          }
          break;
        case "city":
          // Check if this city is in use by any subdistricts
          const cityInUse = subdistrictsList.some(
            (subdistrict) => subdistrict.city_id === itemToDelete.id
          );
          if (cityInUse) {
            toast.error(
              "Cannot delete this city as it is associated with one or more subdistricts"
            );
            setShowDeleteDialog(false);
            return;
          }
          setCitiesList((prev) =>
            prev.filter((city) => city.id !== itemToDelete.id)
          );
          toast.success("City deleted successfully");
          break;
      }
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    try {
      await deleteBranch(branch.id);
      setBranchesList((prev) => prev.filter((b) => b.id !== branch.id));
      toast.success("Branch deleted successfully");
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  };

  const handleDeleteSubdistrict = async (subdistrict: Subdistrict) => {
    try {
      // Check if this subdistrict is in use by any branches
      const subdistrictInUse = branchesList.some(
        (branch) => branch.subdistrict_id === subdistrict.id
      );
      if (subdistrictInUse) {
        toast.error(
          "Cannot delete this subdistrict as it is being used by one or more branches"
        );
        return;
      }

      await deleteSubdistrict(subdistrict.id);
      setSubdistrictsList((prev) =>
        prev.filter((s) => s.id !== subdistrict.id)
      );
      toast.success("Subdistrict deleted successfully");
    } catch (error) {
      toast.error("Failed to delete subdistrict");
    }
  };

  const getSubdistrictName = (branch: Branch) => {
    return `${branch.subdistricts.name} (${branch.subdistricts.cities.name})`;
  };

  const getCityName = (subdistrict: Subdistrict) => {
    return subdistrict.cities.name;
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Location Management</h1>

        <Tabs defaultValue="branches" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="branches" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Branches
            </TabsTrigger>
            <TabsTrigger
              value="subdistricts"
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Subdistricts
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Cities
            </TabsTrigger>
          </TabsList>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Branches</h2>
              <Button
                onClick={() => {
                  setEditingBranch(null);
                  setBranchForm({
                    id: "",
                    name: "",
                    subdistrict_id:
                      subdistrictsList.length > 0 ? subdistrictsList[0].id : "",
                  });
                  setShowBranchDialog(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Branch
              </Button>
            </div>
            <div className="bg-white shadow-md rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subdistrict</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchesList.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        {branch.name}
                      </TableCell>
                      <TableCell>{getSubdistrictName(branch)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBranch(branch)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(branch.id, "branch")}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {branchesList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No branches found. Click "Add Branch" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Subdistricts Tab */}
          <TabsContent value="subdistricts">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Subdistricts</h2>
              <Button
                onClick={() => {
                  setEditingSubdistrict(null);
                  setSubdistrictForm({
                    id: "",
                    name: "",
                    city_id: citiesList.length > 0 ? citiesList[0].id : "",
                  });
                  setShowSubdistrictDialog(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Subdistrict
              </Button>
            </div>
            <div className="bg-white shadow-md rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subdistrictsList.map((subdistrict) => (
                    <TableRow key={subdistrict.id}>
                      <TableCell className="font-medium">
                        {subdistrict.name}
                      </TableCell>
                      <TableCell>{getCityName(subdistrict)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSubdistrict(subdistrict)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(subdistrict.id, "subdistrict")
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subdistrictsList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No subdistricts found. Click "Add Subdistrict" to create
                        one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cities</h2>
              <Button
                onClick={() => {
                  setEditingCity(null);
                  setCityForm({
                    id: "",
                    name: "",
                  });
                  setShowCityDialog(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add City
              </Button>
            </div>
            <div className="bg-white shadow-md rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citiesList.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCity(city)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(city.id, "city")}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {citiesList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No cities found. Click "Add City" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Branch Dialog */}
        <AlertDialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingBranch ? "Edit Branch" : "Add New Branch"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="branchName" className="text-sm font-medium">
                  Branch Name
                </label>
                <Input
                  id="branchName"
                  value={branchForm.name}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, name: e.target.value })
                  }
                  placeholder="Enter branch name"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="subdistrictSelect"
                  className="text-sm font-medium"
                >
                  Subdistrict
                </label>
                <Select
                  value={branchForm.subdistrict_id}
                  onValueChange={(value) =>
                    setBranchForm({ ...branchForm, subdistrict_id: value })
                  }
                >
                  <SelectTrigger id="subdistrictSelect">
                    <SelectValue placeholder="Select subdistrict" />
                  </SelectTrigger>
                  <SelectContent>
                    {subdistrictsList.map((subdistrict) => (
                      <SelectItem key={subdistrict.id} value={subdistrict.id}>
                        {subdistrict.name} ({getCityName(subdistrict)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveBranch}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Subdistrict Dialog */}
        <AlertDialog
          open={showSubdistrictDialog}
          onOpenChange={setShowSubdistrictDialog}
        >
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingSubdistrict
                  ? "Edit Subdistrict"
                  : "Add New Subdistrict"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label
                  htmlFor="subdistrictName"
                  className="text-sm font-medium"
                >
                  Subdistrict Name
                </label>
                <Input
                  id="subdistrictName"
                  value={subdistrictForm.name}
                  onChange={(e) =>
                    setSubdistrictForm({
                      ...subdistrictForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter subdistrict name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="citySelect" className="text-sm font-medium">
                  City
                </label>
                <Select
                  value={subdistrictForm.city_id}
                  onValueChange={(value) =>
                    setSubdistrictForm({ ...subdistrictForm, city_id: value })
                  }
                >
                  <SelectTrigger id="citySelect">
                    <SelectValue placeholder="Select city" />
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
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveSubdistrict}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* City Dialog */}
        <AlertDialog open={showCityDialog} onOpenChange={setShowCityDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingCity ? "Edit City" : "Add New City"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="cityName" className="text-sm font-medium">
                  City Name
                </label>
                <Input
                  id="cityName"
                  value={cityForm.name}
                  onChange={(e) =>
                    setCityForm({ ...cityForm, name: e.target.value })
                  }
                  placeholder="Enter city name"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveCity}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {itemToDelete?.type} "
                {getDeleteItemName()}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
