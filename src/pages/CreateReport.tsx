
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { SalesItem } from '@/types';

export default function CreateReport() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  // Sales items state
  const [salesItems, setSalesItems] = useState<SalesItem[]>([
    { id: '1', productName: '', quantity: 0, unitPrice: 0, totalPrice: 0 },
  ]);

  if (!user || user.role !== 'branch_user') {
    navigate('/');
    return null;
  }

  const handleSalesItemChange = (id: string, field: keyof SalesItem, value: string | number) => {
    const updatedItems = salesItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price if quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setSalesItems(updatedItems);
  };

  const addSalesItem = () => {
    const newId = (salesItems.length + 1).toString();
    setSalesItems([...salesItems, { 
      id: newId, 
      productName: '', 
      quantity: 0, 
      unitPrice: 0, 
      totalPrice: 0 
    }]);
  };

  const removeSalesItem = (id: string) => {
    if (salesItems.length > 1) {
      setSalesItems(salesItems.filter(item => item.id !== id));
    } else {
      toast.error("You need at least one sales item");
    }
  };

  const calculateTotalSales = (): number => {
    return salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
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
    
    // Validate sales items
    const invalidItems = salesItems.filter(
      item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice <= 0
    );
    
    if (invalidItems.length > 0) {
      toast.error("Please complete all sales items with valid data");
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
          <h1 className="text-3xl font-bold mb-8">Create New Sales Report</h1>
          
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Monthly Sales Report"
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
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Sales Items</h2>
              
              <div className="space-y-4">
                {salesItems.map((item, index) => (
                  <div key={item.id} className="glass-panel p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Item #{index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSalesItem(item.id)}
                        className="h-8 w-8 p-0"
                        disabled={salesItems.length <= 1}
                      >
                        &times;
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`product-${item.id}`}>Product</Label>
                        <Input
                          id={`product-${item.id}`}
                          value={item.productName}
                          onChange={(e) => handleSalesItemChange(item.id, 'productName', e.target.value)}
                          placeholder="Product name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleSalesItemChange(item.id, 'quantity', Number(e.target.value))}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`price-${item.id}`}>Unit Price ($)</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleSalesItemChange(item.id, 'unitPrice', Number(e.target.value))}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Total</Label>
                        <div className="mt-1 py-2 px-3 border border-input rounded-md bg-muted/50">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSalesItem}
                  className="w-full mt-2 button-transition"
                >
                  + Add Another Item
                </Button>
              </div>
              
              <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Sales:</span>
                  <span className="text-lg font-bold">${calculateTotalSales().toFixed(2)}</span>
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
