
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Trash2, Shield, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone_number?: string;
  created_at: string;
  last_login?: string;
}

const mockUsers: User[] = [
  { 
    id: '1', 
    email: 'admin@example.com', 
    name: 'John Admin', 
    role: 'admin', 
    phone_number: '+1234567890',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-20T10:30:00Z'
  },
  { 
    id: '2', 
    email: 'user@example.com', 
    name: 'Jane User', 
    role: 'user', 
    phone_number: '+0987654321',
    created_at: '2024-01-02T00:00:00Z',
    last_login: '2024-01-19T15:45:00Z'
  },
  { 
    id: '3', 
    email: 'surveyor1@example.com', 
    name: 'Mike Surveyor', 
    role: 'user', 
    phone_number: '+1122334455',
    created_at: '2024-01-05T00:00:00Z',
    last_login: '2024-01-18T09:20:00Z'
  },
];

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'user',
    phone_number: '',
  });

  const handleAddUser = () => {
    if (!newUser.email || !newUser.name || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    if (users.some(user => user.email === newUser.email)) {
      toast({
        title: "Error",
        description: "A user with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone_number: newUser.phone_number || undefined,
      created_at: new Date().toISOString(),
    };

    setUsers([...users, user]);
    setNewUser({ email: '', name: '', role: 'user', phone_number: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "User added successfully",
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === 'admin@example.com') {
      toast({
        title: "Error",
        description: "Cannot delete the default admin user",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  const getRoleBadge = (role: 'admin' | 'user') => {
    return role === 'admin' 
      ? <Badge className="bg-red-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
      : <Badge variant="secondary" className="bg-blue-600"><User className="w-3 h-3 mr-1" />User</Badge>;
  };

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Users</h2>
          <p className="text-gray-400">Add, remove, and manage user accounts</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new user account in the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name *</Label>
                <Input
                  id="user-name"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-phone">Phone Number</Label>
                <Input
                  id="user-phone"
                  placeholder="Enter phone number"
                  value={newUser.phone_number}
                  onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role *</Label>
                <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="user" className="text-white hover:bg-gray-700">User</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{user.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.phone_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{user.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                {user.last_login && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Login:</span>
                    <span className="text-white">
                      {new Date(user.last_login).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.email === 'admin@example.com'}
                    className="text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="text-gray-400 text-center mb-4">
              Get started by adding your first user to the system
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageUsers;
