
import React, { useState } from 'react';
import { UserPlus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';

// Sample data
const initialData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
  { id: 3, name: "Robert Johnson", email: "robert@example.com", role: "Editor", status: "Inactive" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", role: "User", status: "Active" },
  { id: 5, name: "Michael Wilson", email: "michael@example.com", role: "User", status: "Active" },
  { id: 6, name: "Sarah Brown", email: "sarah@example.com", role: "Editor", status: "Active" },
  { id: 7, name: "David Miller", email: "david@example.com", role: "User", status: "Inactive" },
  { id: 8, name: "Jessica Wilson", email: "jessica@example.com", role: "User", status: "Active" },
  { id: 9, name: "Thomas Anderson", email: "thomas@example.com", role: "Admin", status: "Active" },
  { id: 10, name: "Lisa Taylor", email: "lisa@example.com", role: "Editor", status: "Active" },
  { id: 11, name: "James Martin", email: "james@example.com", role: "User", status: "Inactive" },
  { id: 12, name: "Jennifer Lewis", email: "jennifer@example.com", role: "User", status: "Active" },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
];

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: user?.id || 0,
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'User',
    status: user?.status || 'Active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={formData.role}
          onValueChange={(value) => handleSelectChange('role', value)}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Editor">Editor</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

const Users = () => {
  const [users, setUsers] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  const handleCreateUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitUser = (userData) => {
    if (userData.id === 0) {
      // Create new user
      const newUser = {
        ...userData,
        id: Math.max(0, ...users.map(u => u.id)) + 1
      };
      setUsers([newUser, ...users]);
      toast({
        title: "User Created",
        description: `${newUser.name} has been successfully created.`,
      });
    } else {
      // Update existing user
      setUsers(users.map(user => 
        user.id === userData.id ? userData : user
      ));
      toast({
        title: "User Updated",
        description: `${userData.name} has been successfully updated.`,
      });
    }
    setIsModalOpen(false);
  };

  const confirmDeleteUser = () => {
    if (currentUser) {
      setUsers(users.filter(user => user.id !== currentUser.id));
      toast({
        title: "User Deleted",
        description: `${currentUser.name} has been removed from the system.`,
        variant: "destructive",
      });
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage your system users and their permissions.</p>
        </div>
        <Button onClick={handleCreateUser} className="md:self-start animate-fade-in">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser ? "Edit User" : "Create New User"}
      >
        <UserForm
          user={currentUser}
          onSubmit={handleSubmitUser}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Are you sure you want to delete this user?</p>
            {currentUser && (
              <p className="text-muted-foreground mt-1">
                {currentUser.name} ({currentUser.email})
              </p>
            )}
            <p className="text-muted-foreground mt-4 text-sm">
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
