
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

type UserRole = 'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer' | 'user';

export function UserManagement() {
  const { addUser, user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        title: "Error",
        description: "Please select a role for the new user",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Only admin and manager can add users
      if (user?.role !== 'admin' && user?.role !== 'manager') {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to add users",
          variant: "destructive"
        });
        return;
      }

      await addUser(email, role as UserRole, name);
      
      toast({
        title: "Success",
        description: `Added ${name || email} as ${role}`,
      });
      
      // Reset form
      setEmail('');
      setName('');
      setRole('');
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Failed to add user",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Add new users to the system with specific roles
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAddUser}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole as (value: string) => void}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="csr">Customer Service Rep</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="tech">Technician</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="user">General User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding User..." : "Add User"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
