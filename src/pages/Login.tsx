
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

export default function Login() {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [signupAttempted, setSignupAttempted] = useState(false);
  
  // Authentication context
  const { user, login, signUp, isLoading, error, createDemoAccount } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempted(true);
    
    if (!email || !password) return;
    
    await login(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupAttempted(true);
    
    if (!signupEmail || !signupPassword || !name) return;
    
    if (signupPassword !== confirmPassword) {
      return; // Form validation will show error
    }
    
    await signUp(signupEmail, signupPassword, name);
  };

  // Function to create a demo account for a specific role
  const handleCreateDemoAccount = async (role: 'branch_user' | 'subdistrict_admin' | 'city_admin') => {
    await createDemoAccount(role);
  };

  // Demo account descriptions
  const demoAccounts = [
    { 
      role: 'branch_user', 
      label: 'Branch User',
      description: 'Create and submit reports for a specific branch'
    },
    { 
      role: 'subdistrict_admin', 
      label: 'Sub-District Admin',
      description: 'Review and approve reports from all branches in a sub-district'
    },
    { 
      role: 'city_admin', 
      label: 'City Admin',
      description: 'Review and approve reports from all sub-districts in a city'
    }
  ] as const;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-primary">Bola Bola Ayam</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sales Report Management
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={loginAttempted && !email ? 'border-red-500' : ''}
                    />
                  </div>
                  {loginAttempted && !email && (
                    <p className="mt-1 text-sm text-red-600">Email is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={loginAttempted && !password ? 'border-red-500' : ''}
                    />
                  </div>
                  {loginAttempted && !password && (
                    <p className="mt-1 text-sm text-red-600">Password is required</p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full button-transition button-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* Sign Up Form */}
            <TabsContent value="signup">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="mt-1">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={signupAttempted && !name ? 'border-red-500' : ''}
                    />
                  </div>
                  {signupAttempted && !name && (
                    <p className="mt-1 text-sm text-red-600">Name is required</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="signupEmail">Email address</Label>
                  <div className="mt-1">
                    <Input
                      id="signupEmail"
                      name="signupEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={signupAttempted && !signupEmail ? 'border-red-500' : ''}
                    />
                  </div>
                  {signupAttempted && !signupEmail && (
                    <p className="mt-1 text-sm text-red-600">Email is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="mt-1">
                    <Input
                      id="signupPassword"
                      name="signupPassword"
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className={signupAttempted && !signupPassword ? 'border-red-500' : ''}
                    />
                  </div>
                  {signupAttempted && !signupPassword && (
                    <p className="mt-1 text-sm text-red-600">Password is required</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={signupAttempted && confirmPassword !== signupPassword ? 'border-red-500' : ''}
                    />
                  </div>
                  {signupAttempted && confirmPassword !== signupPassword && (
                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full button-transition button-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing up...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {demoAccounts.map((account) => (
                <div 
                  key={account.role}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-foreground">{account.label}</h3>
                    <Badge variant="outline">{account.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{account.description}</p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleCreateDemoAccount(account.role)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      `Create ${account.label} Account`
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
