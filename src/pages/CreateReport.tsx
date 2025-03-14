
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import NavBar from '@/components/NavBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Save, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LocationInfo, ProductInfo, ExpenseInfo, IncomeInfo, OtherExpense } from '@/types';

export default function CreateReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [title, setTitle] = useState('Daily Sales Report');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  // Block I: Location Information
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    cityName: user?.city || '',
    districtName: user?.subdistrict || '',
    branchName: user?.branch || '',
    branchManager: user?.name || '',
  });
  
  // Block II: Product Information
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    initialStock: 0,
    remainingStock: 0,
    testers: 0,
    rejects: 0,
    sold: 0,
  });
  
  // Block III: Expense Information
  const [expenseInfo, setExpenseInfo] = useState<ExpenseInfo>({
    employeeSalary: 0,
    employeeBonus: 0,
    cookingOil: 0,
    lpgGas: 0,
    plasticBags: 0,
    tissue: 0,
    soap: 0,
    otherExpenses: [
      { id: '1', description: '', amount: 0 },
      { id: '2', description: '', amount: 0 },
      { id: '3', description: '', amount: 0 },
    ],
    totalExpenses: 0,
  });
  
  // Block IV: Income Information
  const [incomeInfo, setIncomeInfo] = useState<IncomeInfo>({
    cashReceipts: 0,
    transferReceipts: 0,
    remainingIncome: 0,
    totalIncome: 0,
  });

  useEffect(() => {
    // Calculate total expenses
    const totalExpenses = 
      expenseInfo.employeeSalary +
      expenseInfo.employeeBonus +
      expenseInfo.cookingOil +
      expenseInfo.lpgGas +
      expenseInfo.plasticBags +
      expenseInfo.tissue +
      expenseInfo.soap +
      expenseInfo.otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate total income
    const totalIncome = incomeInfo.cashReceipts + incomeInfo.transferReceipts;
    
    // Calculate remaining income (net)
    const remainingIncome = totalIncome - totalExpenses;
    
    setExpenseInfo(prev => ({ ...prev, totalExpenses }));
    setIncomeInfo(prev => ({ 
      ...prev, 
      totalIncome,
      remainingIncome 
    }));
  }, [
    expenseInfo.employeeSalary,
    expenseInfo.employeeBonus,
    expenseInfo.cookingOil,
    expenseInfo.lpgGas,
    expenseInfo.plasticBags,
    expenseInfo.tissue,
    expenseInfo.soap,
    expenseInfo.otherExpenses,
    incomeInfo.cashReceipts,
    incomeInfo.transferReceipts
  ]);

  // Calculate sales based on stock
  useEffect(() => {
    if (productInfo.initialStock >= productInfo.remainingStock) {
      const sold = productInfo.initialStock - productInfo.remainingStock - productInfo.testers - productInfo.rejects;
      setProductInfo(prev => ({ ...prev, sold: sold >= 0 ? sold : 0 }));
    }
  }, [productInfo.initialStock, productInfo.remainingStock, productInfo.testers, productInfo.rejects]);

  if (!user || user.role !== 'branch_user') {
    navigate('/');
    return null;
  }

  const handleLocationChange = (field: keyof LocationInfo, value: string) => {
    setLocationInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (field: keyof ProductInfo, value: number) => {
    setProductInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleExpenseChange = (field: keyof Omit<ExpenseInfo, 'otherExpenses' | 'totalExpenses'>, value: number) => {
    setExpenseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOtherExpenseChange = (id: string, field: 'description' | 'amount', value: string | number) => {
    setExpenseInfo(prev => ({
      ...prev,
      otherExpenses: prev.otherExpenses.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleIncomeChange = (field: keyof Omit<IncomeInfo, 'remainingIncome' | 'totalIncome'>, value: number) => {
    setIncomeInfo(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Please enter a report title");
      return false;
    }
    
    if (!date) {
      toast.error("Please select a date");
      return false;
    }
    
    if (!content.trim()) {
      toast.error("Please enter report content");
      return false;
    }
    
    // Validate location info
    if (!locationInfo.cityName || !locationInfo.districtName || !locationInfo.branchName || !locationInfo.branchManager) {
      toast.error("Please complete all location information");
      return false;
    }
    
    // Validate product info
    if (productInfo.initialStock < 0 || productInfo.testers > 5) {
      toast.error("Invalid product information. Note: Testers cannot exceed 5");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setIsDraft(saveAsDraft);
    
    if (!saveAsDraft && !validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (saveAsDraft) {
        toast.success("Report saved as draft");
      } else {
        toast.success("Report submitted successfully");
      }
      
      navigate('/');
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Edit Sales Report' : 'Create New Sales Report'}</h1>
          
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Daily Sales Report"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Report Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Select a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Report Summary</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide a summary of your sales report..."
                  className="mt-1 h-24"
                />
              </div>
            </div>
            
            {/* Block I: Location Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Block I: Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cityName">City Name</Label>
                  <Input
                    id="cityName"
                    value={locationInfo.cityName}
                    onChange={(e) => handleLocationChange('cityName', e.target.value)}
                    placeholder="City name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="districtName">District Name</Label>
                  <Input
                    id="districtName"
                    value={locationInfo.districtName}
                    onChange={(e) => handleLocationChange('districtName', e.target.value)}
                    placeholder="District name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    value={locationInfo.branchName}
                    onChange={(e) => handleLocationChange('branchName', e.target.value)}
                    placeholder="Branch name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="branchManager">Branch Manager</Label>
                  <Input
                    id="branchManager"
                    value={locationInfo.branchManager}
                    onChange={(e) => handleLocationChange('branchManager', e.target.value)}
                    placeholder="Manager name"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Block II: Product Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Block II: Product Information (in items)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="initialStock">Initial Stock</Label>
                  <Input
                    id="initialStock"
                    type="number"
                    min="0"
                    value={productInfo.initialStock || ''}
                    onChange={(e) => handleProductChange('initialStock', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="remainingStock">Remaining Stock</Label>
                  <Input
                    id="remainingStock"
                    type="number"
                    min="0"
                    max={productInfo.initialStock}
                    value={productInfo.remainingStock || ''}
                    onChange={(e) => handleProductChange('remainingStock', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="testers">Number of Testers (max 5)</Label>
                  <Input
                    id="testers"
                    type="number"
                    min="0"
                    max="5"
                    value={productInfo.testers || ''}
                    onChange={(e) => handleProductChange('testers', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rejects">Number of Rejects</Label>
                  <Input
                    id="rejects"
                    type="number"
                    min="0"
                    value={productInfo.rejects || ''}
                    onChange={(e) => handleProductChange('rejects', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sold">Number Sold</Label>
                  <div className="mt-1 py-2 px-3 border border-input rounded-md bg-muted/50">
                    {productInfo.sold}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Block III: Expense Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Block III: Expense Information (in rupiah)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeSalary">Employee Salary</Label>
                  <Input
                    id="employeeSalary"
                    type="number"
                    min="0"
                    value={expenseInfo.employeeSalary || ''}
                    onChange={(e) => handleExpenseChange('employeeSalary', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeBonus">Employee Bonus</Label>
                  <Input
                    id="employeeBonus"
                    type="number"
                    min="0"
                    value={expenseInfo.employeeBonus || ''}
                    onChange={(e) => handleExpenseChange('employeeBonus', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cookingOil">Cooking Oil</Label>
                  <Input
                    id="cookingOil"
                    type="number"
                    min="0"
                    value={expenseInfo.cookingOil || ''}
                    onChange={(e) => handleExpenseChange('cookingOil', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lpgGas">LPG Gas</Label>
                  <Input
                    id="lpgGas"
                    type="number"
                    min="0"
                    value={expenseInfo.lpgGas || ''}
                    onChange={(e) => handleExpenseChange('lpgGas', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="plasticBags">Plastic Bags</Label>
                  <Input
                    id="plasticBags"
                    type="number"
                    min="0"
                    value={expenseInfo.plasticBags || ''}
                    onChange={(e) => handleExpenseChange('plasticBags', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tissue">Tissue</Label>
                  <Input
                    id="tissue"
                    type="number"
                    min="0"
                    value={expenseInfo.tissue || ''}
                    onChange={(e) => handleExpenseChange('tissue', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="soap">Soap</Label>
                  <Input
                    id="soap"
                    type="number"
                    min="0"
                    value={expenseInfo.soap || ''}
                    onChange={(e) => handleExpenseChange('soap', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-4 mb-2">Other Expenses</h3>
              {expenseInfo.otherExpenses.map((expense, index) => (
                <div key={expense.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor={`expense-desc-${expense.id}`}>Description {index + 1}</Label>
                    <Input
                      id={`expense-desc-${expense.id}`}
                      value={expense.description}
                      onChange={(e) => handleOtherExpenseChange(expense.id, 'description', e.target.value)}
                      placeholder="Expense description"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`expense-amount-${expense.id}`}>Amount {index + a1}</Label>
                    <Input
                      id={`expense-amount-${expense.id}`}
                      type="number"
                      min="0"
                      value={expense.amount || ''}
                      onChange={(e) => handleOtherExpenseChange(expense.id, 'amount', Number(e.target.value))}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Expenses:</span>
                  <span className="text-lg font-bold">{formatCurrency(expenseInfo.totalExpenses)}</span>
                </div>
              </div>
            </div>
            
            {/* Block IV: Income Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Block IV: Income Information (in rupiah)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cashReceipts">Cash Receipts</Label>
                  <Input
                    id="cashReceipts"
                    type="number"
                    min="0"
                    value={incomeInfo.cashReceipts || ''}
                    onChange={(e) => handleIncomeChange('cashReceipts', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="transferReceipts">Transfer Receipts</Label>
                  <Input
                    id="transferReceipts"
                    type="number"
                    min="0"
                    value={incomeInfo.transferReceipts || ''}
                    onChange={(e) => handleIncomeChange('transferReceipts', Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="totalIncome">Total Income</Label>
                  <div className="mt-1 py-2 px-3 border border-input rounded-md bg-muted/50">
                    {formatCurrency(incomeInfo.totalIncome)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="remainingIncome">Remaining Income (Net)</Label>
                  <div className={cn(
                    "mt-1 py-2 px-3 border rounded-md font-medium",
                    incomeInfo.remainingIncome >= 0 
                      ? "bg-status-approved/10 border-status-approved/30 text-status-approved" 
                      : "bg-status-rejected/10 border-status-rejected/30 text-status-rejected"
                  )}>
                    {formatCurrency(incomeInfo.remainingIncome)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="button-transition flex items-center gap-2"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
              >
                {isSubmitting && isDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save as Draft
              </Button>
              
              <Button
                type="submit"
                className="button-transition button-hover flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && !isDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
