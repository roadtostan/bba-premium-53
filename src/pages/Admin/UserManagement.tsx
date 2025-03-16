import React, { useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { getUsers } from '@/lib/data';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { User as UserIcon, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await getUsers();
        setUsersList(users);
      } catch (error) {
        toast.error('Failed to load users');
      }
    }
    loadUsers();
  }, []);
  
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    branch?: string;
    subdistrict?: string;
    city?: string;
  }>({
    id: '',
    name: '',
    email: '',
    role: 'branch_user',
    branch: '',
    subdistrict: '',
    city: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      id: `u${usersList.length + 1}`,
      name: '',
      email: '',
      role: 'branch_user',
      branch: '',
      subdistrict: '',
      city: ''
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
      branch: user.branch || '',
      subdistrict: user.subdistrict || '',
      city: user.city || ''
    });
    setShowAddEditDialog(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      setUsersList(prev => 
        prev.map(user => user.id === editingUser.id ? formData : user)
      );
      toast.success('User updated successfully');
    } else {
      setUsersList(prev => [...prev, formData]);
      toast.success('User added successfully');
    }

    setShowAddEditDialog(false);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsersList(usersList.filter(user => user.id !== userToDelete.id));
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'branch_user':
        return 'Branch User';
      case 'subdistrict_admin':
        return 'Sub-district Admin';
      case 'city_admin':
        return 'City Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return role;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleDisplay(user.role)}</TableCell>
                  <TableCell>
                    {user.branch && <div>Branch: {user.branch}</div>}
                    {user.subdistrict && <div>District: {user.subdistrict}</div>}
                    {user.city && <div>City: {user.city}</div>}
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
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the user {userToDelete?.name}.
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

        <AlertDialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Full Name" 
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="email@example.com" 
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="role" className="text-sm font-medium">Role</label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch_user">Branch User</SelectItem>
                    <SelectItem value="subdistrict_admin">Sub-district Admin</SelectItem>
                    <SelectItem value="city_admin">City Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.role === 'branch_user' && (
                <>
                  <div className="grid gap-2">
                    <label htmlFor="branch" className="text-sm font-medium">Branch</label>
                    <Input 
                      id="branch" 
                      name="branch" 
                      value={formData.branch || ''} 
                      onChange={handleInputChange} 
                      placeholder="Branch Name" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="subdistrict" className="text-sm font-medium">Sub-district</label>
                    <Input 
                      id="subdistrict" 
                      name="subdistrict" 
                      value={formData.subdistrict || ''} 
                      onChange={handleInputChange} 
                      placeholder="Sub-district Name" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="city" className="text-sm font-medium">City</label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city || ''} 
                      onChange={handleInputChange} 
                      placeholder="City Name" 
                    />
                  </div>
                </>
              )}
              
              {formData.role === 'subdistrict_admin' && (
                <>
                  <div className="grid gap-2">
                    <label htmlFor="subdistrict" className="text-sm font-medium">Sub-district</label>
                    <Input 
                      id="subdistrict" 
                      name="subdistrict" 
                      value={formData.subdistrict || ''} 
                      onChange={handleInputChange} 
                      placeholder="Sub-district Name" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="city" className="text-sm font-medium">City</label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city || ''} 
                      onChange={handleInputChange} 
                      placeholder="City Name" 
                    />
                  </div>
                </>
              )}
              
              {formData.role === 'city_admin' && (
                <div className="grid gap-2">
                  <label htmlFor="city" className="text-sm font-medium">City</label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={formData.city || ''} 
                    onChange={handleInputChange} 
                    placeholder="City Name" 
                  />
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveUser}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
