import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { User } from '@/pages/Index';
import { API_ENDPOINTS } from '@/utils/config';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateIdentifier = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;  // Assumes 10-digit phone numbers
  
    if (!value) {
      toast({
        title: "Validation Error",
        description: "Telephone number or e-mail is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid e-mail address or Telephone number",
        variant: "destructive",
      });
      return false;
    }
  
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive",
      });
      return false;
    }
    if (password.length < 5) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 5 characters",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isIdentifierValid = validateIdentifier(identifier);
    const isPasswordValid = validatePassword(password);

    if (!isIdentifierValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          identifier, 
          password 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error('Enter Correct e-mail/Telephone and Password');
      }

      const data = await response.json();
      
      if (data.id) {
        const user: User = {
          id: data.id.toString(),
          name: data.name,
          role: data.role,
          email: data.email || identifier,
          phone_number: data.phone_number || identifier
        };

        localStorage.setItem('userId', data.id.toString());
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);

        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        onLogin(user);
      } else {
        throw new Error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : 'Network error. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Survey Dashboard</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to access your survey management portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-gray-300">Email or Phone Number</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
