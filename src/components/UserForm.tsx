'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createUser } from '@/app/actions';

export default function UserForm() {
  const [email, setEmail] = useState('');
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }
    if (!password) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      await createUser({ email, username, password });

      // Reset form
      setEmail('');
      setName('');
      setPassword('');

      toast.success('User created successfully');

      // Refresh the page data to show the new user
      router.refresh();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error((error as Error).message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm bg-white overflow-hidden border-0 pt-0 self-start">
      <CardHeader className="bg-blue-50 border-b px-6 py-5 rounded-none">
        <CardTitle className="text-xl text-blue-900">Add New User</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1.5 block">
              username
            </Label>
            <Input id="username" placeholder="John Doe" value={username} onChange={(e) => setName(e.target.value)} className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input id="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <Button onClick={handleCreateUser} disabled={loading} className="w-full h-11 mt-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200">
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
