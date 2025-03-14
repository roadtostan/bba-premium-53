
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Building, City, MapPin, Pencil, Plus, Trash } from 'lucide-react';
import { branches, subdistricts, cities } from '@/lib/data';
import { toast } from 'sonner';

type Branch = { id: string; name: string; subdistrictId: string };
type Subdistrict = { id: string; name: string; cityId: string };
type City = { id: string; name: string };

export default function LocationManagement() {
  const [branchesList, setBranchesList] = useState<Branch[]>(branches);
  const [subdistrictsList, setSubdistrictsList] = useState<Subdistrict[]>(subdistricts);
  const [citiesList, setCitiesList] = useState<City[]>(cities);

  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showSubdistrictDialog, setShowSubdistrictDialog] = useState(false);
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingSubdistrict, setEditingSubdistrict] = useState<Subdistrict | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'branch' | 'subdistrict' | 'city'} | null>(null);

  const [branchForm, setBranchForm] = useState({
    id: '',
    name: '',
    subdistrictId: ''
  });

  const [subdistrictForm, setSubdistrictForm] = useState({
    id: '',
    name: '',
    cityId: ''
  });

  const [cityForm, setCityForm] = useState({
    id: '',
    name: ''
  });

  // Branch handlers
  const handleAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      id: `b${branchesList.length + 1}`,
      name: '',
      subdistrictId: subdistrictsList.length > 0 ? subdistrictsList[0].id : ''
    });
    setShowBranchDialog(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({...branch});
    setShowBranchDialog(true);
  };

  const handleSaveBranch = () => {
    if (!branchForm.name || !branchForm.subdistrictId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingBranch) {
      // Update
      setBranchesList(prev => 
        prev.map(branch => branch.id === editingBranch.id ? branchForm : branch)
      );
      toast.success('Branch updated successfully');
    } else {
      // Add
      setBranchesList(prev => [...prev, branchForm]);
      toast.success('Branch added successfully');
    }
    setShowBranchDialog(false);
  };

  // Subdistrict handlers
  const handleAddSubdistrict = () => {
    setEditingSubdistrict(null);
    setSubdistrictForm({
      id: `sd${subdistrictsList.length + 1}`,
      name: '',
      cityId: citiesList.length > 0 ? citiesList[0].id : ''
    });
    setShowSubdistrictDialog(true);
  };

  const handleEditSubdistrict = (subdistrict: Subdistrict) => {
    setEditingSubdistrict(subdistrict);
    setSubdistrictForm({...subdistrict});
    setShowSubdistrictDialog(true);
  };

  const handleSaveSubdistrict = () => {
    if (!subdistrictForm.name || !subdistrictForm.cityId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingSubdistrict) {
      // Update
      setSubdistrictsList(prev => 
        prev.map(subdistrict => subdistrict.id === editingSubdistrict.id ? subdistrictForm : subdistrict)
      );
      toast.success('Subdistrict updated successfully');
    } else {
      // Add
      setSubdistrictsList(prev => [...prev, subdistrictForm]);
      toast.success('Subdistrict added successfully');
    }
    setShowSubdistrictDialog(false);
  };

  // City handlers
  const handleAddCity = () => {
    setEditingCity(null);
    setCityForm({
      id: `c${citiesList.length + 1}`,
      name: ''
    });
    setShowCityDialog(true);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityForm({...city});
    setShowCityDialog(true);
  };

  const handleSaveCity = () => {
    if (!cityForm.name) {
      toast.error('Please enter a city name');
      return;
    }

    if (editingCity) {
      // Update
      setCitiesList(prev => 
        prev.map(city => city.id === editingCity.id ? cityForm : city)
      );
      toast.success('City updated successfully');
    } else {
      // Add
      setCitiesList(prev => [...prev, cityForm]);
      toast.success('City added successfully');
    }
    setShowCityDialog(false);
  };

  // Delete handlers
  const handleDeleteClick = (id: string, type: 'branch' | 'subdistrict' | 'city') => {
    setItemToDelete({ id, type });
    setShowDeleteDialog(true);
  };

  const getDeleteItemName = () => {
    if (!itemToDelete) return '';
    
    switch (itemToDelete.type) {
      case 'branch':
        return branchesList.find(b => b.id === itemToDelete.id)?.name || '';
      case 'subdistrict':
        return subdistrictsList.find(s => s.id === itemToDelete.id)?.name || '';
      case 'city':
        return citiesList.find(c => c.id === itemToDelete.id)?.name || '';
    }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    switch (itemToDelete.type) {
      case 'branch':
        setBranchesList(prev => prev.filter(branch => branch.id !== itemToDelete.id));
        toast.success('Branch deleted successfully');
        break;
      case 'subdistrict':
        // Check if this subdistrict is in use by any branches
        const subdistrictInUse = branchesList.some(branch => branch.subdistrictId === itemToDelete.id);
        if (subdistrictInUse) {
          toast.error('Cannot delete this subdistrict as it is associated with one or more branches');
          setShowDeleteDialog(false);
          return;
        }
        setSubdistrictsList(prev => prev.filter(subdistrict => subdistrict.id !== itemToDelete.id));
        toast.success('Subdistrict deleted successfully');
        break;
      case 'city':
        // Check if this city is in use by any subdistricts
        const cityInUse = subdistrictsList.some(subdistrict => subdistrict.cityId === itemToDelete.id);
        if (cityInUse) {
          toast.error('Cannot delete this city as it is associated with one or more subdistricts');
          setShowDeleteDialog(false);
          return;
        }
        setCitiesList(prev => prev.filter(city => city.id !== itemToDelete.id));
        toast.success('City deleted successfully');
        break;
    }
    
    setShowDeleteDialog(false);
  };

  const getSubdistrictName = (id: string) => {
    return subdistrictsList.find(sd => sd.id === id)?.name || 'Unknown';
  };

  const getCityName = (id: string) => {
    return citiesList.find(c => c.id === id)?.name || 'Unknown';
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
            <TabsTrigger value="subdistricts" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Subdistricts
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <City className="h-4 w-4" />
              Cities
            </TabsTrigger>
          </TabsList>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Branches</h2>
              <Button onClick={handleAddBranch} className="flex items-center gap-2">
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
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{getSubdistrictName(branch.subdistrictId)}</TableCell>
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
                          onClick={() => handleDeleteClick(branch.id, 'branch')}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {branchesList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
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
              <Button onClick={handleAddSubdistrict} className="flex items-center gap-2">
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
                      <TableCell className="font-medium">{subdistrict.name}</TableCell>
                      <TableCell>{getCityName(subdistrict.cityId)}</TableCell>
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
                          onClick={() => handleDeleteClick(subdistrict.id, 'subdistrict')}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subdistrictsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No subdistricts found. Click "Add Subdistrict" to create one.
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
              <Button onClick={handleAddCity} className="flex items-center gap-2">
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
                          onClick={() => handleDeleteClick(city.id, 'city')}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {citiesList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
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
              <AlertDialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="branchName" className="text-sm font-medium">Branch Name</label>
                <Input 
                  id="branchName" 
                  value={branchForm.name} 
                  onChange={(e) => setBranchForm({...branchForm, name: e.target.value})} 
                  placeholder="Enter branch name" 
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="subdistrictSelect" className="text-sm font-medium">Subdistrict</label>
                <Select 
                  value={branchForm.subdistrictId} 
                  onValueChange={(value) => setBranchForm({...branchForm, subdistrictId: value})}
                >
                  <SelectTrigger id="subdistrictSelect">
                    <SelectValue placeholder="Select subdistrict" />
                  </SelectTrigger>
                  <SelectContent>
                    {subdistrictsList.map((subdistrict) => (
                      <SelectItem key={subdistrict.id} value={subdistrict.id}>
                        {subdistrict.name} ({getCityName(subdistrict.cityId)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveBranch}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Subdistrict Dialog */}
        <AlertDialog open={showSubdistrictDialog} onOpenChange={setShowSubdistrictDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{editingSubdistrict ? 'Edit Subdistrict' : 'Add New Subdistrict'}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="subdistrictName" className="text-sm font-medium">Subdistrict Name</label>
                <Input 
                  id="subdistrictName" 
                  value={subdistrictForm.name} 
                  onChange={(e) => setSubdistrictForm({...subdistrictForm, name: e.target.value})} 
                  placeholder="Enter subdistrict name" 
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="citySelect" className="text-sm font-medium">City</label>
                <Select 
                  value={subdistrictForm.cityId} 
                  onValueChange={(value) => setSubdistrictForm({...subdistrictForm, cityId: value})}
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
              <AlertDialogAction onClick={handleSaveSubdistrict}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* City Dialog */}
        <AlertDialog open={showCityDialog} onOpenChange={setShowCityDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{editingCity ? 'Edit City' : 'Add New City'}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="cityName" className="text-sm font-medium">City Name</label>
                <Input 
                  id="cityName" 
                  value={cityForm.name} 
                  onChange={(e) => setCityForm({...cityForm, name: e.target.value})} 
                  placeholder="Enter city name" 
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveCity}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {itemToDelete?.type} "{getDeleteItemName()}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
