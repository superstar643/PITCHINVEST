import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Save, Plus, Trash2, DollarSign, Loader2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';

interface PricingPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  user_type: string | null;
  country: string | null;
  monthly_price: number;
  currency: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPricing: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Get current session to ensure user is authenticated
  const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };
  
  // Check admin access
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin && !adminLoading) {
      loadPricingPlans();
    }
  }, [isAdmin, adminLoading]);

  const loadPricingPlans = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('plan_type', { ascending: true })
        .order('user_type', { ascending: true })
        .order('country', { ascending: true });

      if (error) throw error;
      
      // Ensure monthly_price is always a number
      const plansWithNumbers = (data || []).map(plan => ({
        ...plan,
        monthly_price: typeof plan.monthly_price === 'string' 
          ? parseFloat(plan.monthly_price) 
          : Number(plan.monthly_price) || 0
      }));
      
      setPricingPlans(plansWithNumbers as PricingPlan[]);
     
    } catch (error: any) {
      console.error('Error loading pricing plans:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load pricing plans',
        variant: 'destructive',
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSave = async (plan: Partial<PricingPlan>) => {
    // Validate required fields
    if (!plan.plan_name || !plan.plan_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Plan name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!plan.plan_type) {
      toast({
        title: 'Validation Error',
        description: 'Plan type is required',
        variant: 'destructive',
      });
      return;
    }

    if (!plan.monthly_price || plan.monthly_price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Monthly price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (!plan.currency) {
      toast({
        title: 'Validation Error',
        description: 'Currency is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Verify user session before proceeding
      const session = await getCurrentSession();
      if (!session) {
        throw new Error('You must be logged in to update pricing plans');
      }
      
      // Ensure monthly_price is a number
      const monthlyPrice = typeof plan.monthly_price === 'string' 
        ? parseFloat(plan.monthly_price) 
        : Number(plan.monthly_price);
      
      if (isNaN(monthlyPrice) || monthlyPrice <= 0) {
        throw new Error('Monthly price must be a valid number greater than 0');
      }
      
      const updateData = {
        plan_name: (plan.plan_name || '').trim(),
        plan_type: plan.plan_type,
        user_type: plan.user_type || null,
        country: plan.country || null,
        monthly_price: monthlyPrice, // Ensure it's a number
        currency: plan.currency,
        description: plan.description?.trim() || null,
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        updated_at: new Date().toISOString(),
      };

    

      let error;
      let updatedData;
      
      if (plan.id) {
        // First verify the plan exists and we can read it
        const { data: existingPlan, error: checkError } = await supabase
          .from('pricing_plans')
          .select('id, plan_name, monthly_price')
          .eq('id', plan.id)
          .single();
        
        if (checkError || !existingPlan) {
          console.error('Plan check error:', checkError);
          throw new Error(`Pricing plan with ID ${plan.id} not found or access denied. Error: ${checkError?.message || 'Unknown error'}`);
        }
        
     
        
        // Update existing plan - use upsert approach if update fails
        // First try direct update
        let updateResult;
        let updateError;
        
        const updateResponse = await supabase
          .from('pricing_plans')
          .update(updateData)
          .eq('id', plan.id)
          .select();
        
        updateResult = updateResponse.data;
        updateError = updateResponse.error;
        
        // If update returns 0 rows, it might be an RLS issue
        // Try to verify if the update actually happened by fetching the record
        if (updateError || !updateResult || updateResult.length === 0) {
          console.warn('Update returned 0 rows or error. Checking if update actually succeeded...');
          
          // Wait a brief moment for database to process
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Try to fetch the record to see if it was updated
          const { data: fetchedData, error: fetchError } = await supabase
            .from('pricing_plans')
            .select('*')
            .eq('id', plan.id)
            .single();
          
          if (fetchError) {
            console.error('Cannot fetch record after update:', fetchError);
            // If we can't fetch, the update definitely failed
            throw new Error(`Update failed: ${updateError?.message || 'RLS policy may be blocking updates. Please check your Supabase RLS policies for the pricing_plans table.'}`);
          }
          
          // Check if the data was actually updated
          const priceChanged = fetchedData.monthly_price !== existingPlan.monthly_price;
          const nameChanged = fetchedData.plan_name !== existingPlan.plan_name;
          
          if (!priceChanged && !nameChanged && updateData.monthly_price !== existingPlan.monthly_price) {
            // Data should have changed but didn't - update failed
            throw new Error(`Update failed: Data was not changed. RLS policy may be blocking updates. Current monthly_price: ${fetchedData.monthly_price}, Attempted: ${updateData.monthly_price}`);
          }
          
          // Update succeeded but couldn't return data (RLS blocking return)
          updatedData = fetchedData;
          
        } else {
          updatedData = updateResult[0];
        }
        
       
      } else {
        // Create new plan - use select() to get inserted data
        const { data: insertResult, error: insertError } = await supabase
          .from('pricing_plans')
          .insert([{
            ...updateData,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();
        
        error = insertError;
        updatedData = insertResult;
        
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        
        if (!updatedData) {
          console.error('No data returned from insert');
          throw new Error('Insert operation did not return data');
        }
      }

      toast({
        title: 'Success',
        description: `Pricing plan "${plan.plan_name}" ${plan.id ? 'updated' : 'created'} successfully`,
      });

      // Close form first
      setEditingPlan(null);
      setShowNewForm(false);
      
      // Ensure monthly_price is a number in the returned data
      const updatedPlan: PricingPlan = {
        ...updatedData,
        monthly_price: typeof updatedData.monthly_price === 'string' 
          ? parseFloat(updatedData.monthly_price) 
          : Number(updatedData.monthly_price) || 0
      } as PricingPlan;
      
    
      
      // Immediately update the local state with the returned data for instant UI update
      if (plan.id) {
        // Update existing plan in state immediately
        setPricingPlans(prevPlans => {
          const updated = prevPlans.map(p => p.id === plan.id ? updatedPlan : p);
         
          return updated;
        });
      } else {
        // Add new plan to state
        setPricingPlans(prevPlans => {
          const updated = [...prevPlans, updatedPlan];
          
          return updated;
        });
      }
      
      // Reload all plans from database to ensure complete consistency
      // This ensures we have the latest data including any database triggers or computed fields
      // Don't show loading spinner since we already updated the UI immediately
      await loadPricingPlans(false);
      
      // Scroll to top after save
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error saving pricing plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save pricing plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (plan: PricingPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', planToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Pricing plan "${planToDelete.plan_name}" deleted successfully`,
      });

      await loadPricingPlans();
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error: any) {
      console.error('Error deleting pricing plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete pricing plan',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setShowNewForm(false);
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNewClick = () => {
    setShowNewForm(true);
    setEditingPlan(null);
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancel = () => {
    setShowNewForm(false);
    setEditingPlan(null);
  };

  if (adminLoading || loading) {
    return (
      <LoadingSpinner fullScreen />
    );
  }

  if (!isAdmin) {
    return null;
  }

  const color = '#0a3d5c';

  return (
    <AdminLayout>
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-4xl font-bold text-[#0a3d5c] mb-2">Pricing Management</h1>
                <p className="text-lg font-medium text-gray-700">
                  Manage subscription and advertising pricing plans for different user types and countries.
                </p>
              </div>
              <Button
                onClick={handleNewClick}
                className="bg-[#0a3d5c] hover:bg-[#083146] text-white font-semibold border border-[#0a3d5c] hover:border-[#083146]"
                disabled={saving || deleting}
              >
                <Plus className="mr-2 h-5 w-5" />
                New Pricing Plan
              </Button>
            </div>
          </div>

          {/* New/Edit Form */}
          {(showNewForm || editingPlan) && (
            <Card className="mb-6 border border-[#0a3d5c]" ref={formRef}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#0a3d5c]">{editingPlan ? 'Edit Pricing Plan' : 'New Pricing Plan'}</CardTitle>
                <CardDescription className="text-base font-medium">
                  {editingPlan ? 'Update the pricing plan details below' : 'Fill in the details to create a new pricing plan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingPlanForm
                  plan={editingPlan || undefined}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  saving={saving}
                />
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans List */}
          {pricingPlans.length === 0 ? (
            <Card className="border border-[#0a3d5c]">
              <CardContent className="py-12 text-center">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-700 mb-2 font-medium">No pricing plans found</p>
                <p className="text-base text-gray-600 mb-4">Create your first pricing plan to get started</p>
                <Button
                  onClick={() => {
                    setShowNewForm(true);
                    setEditingPlan(null);
                  }}
                  className="bg-[#0a3d5c] hover:bg-[#083146] text-white font-semibold border border-[#0a3d5c] hover:border-[#083146]"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Pricing Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pricingPlans.map((plan) => {
                const planTypeColors: Record<string, string> = {
                  'subscription': 'border-blue-600 hover:border-blue-700',
                  'advertising': 'border-purple-600 hover:border-purple-700',
                  'logo': 'border-indigo-600 hover:border-indigo-700',
                  'banner': 'border-teal-600 hover:border-teal-700',
                };
                const borderColor = planTypeColors[plan.plan_type] || 'border-[#0a3d5c] hover:border-[#083146]';
                return (
                <Card key={plan.id} className={`hover:shadow-xl transition-shadow border ${borderColor}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl font-bold text-[#0a3d5c]">{plan.plan_name}</CardTitle>
                          <Badge 
                            className={
                              plan.is_active 
                                ? 'bg-green-600 text-white border-0 font-semibold px-3 py-1' 
                                : 'bg-gray-500 text-white border-0 font-semibold px-3 py-1'
                            }
                          >
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className="bg-blue-600 text-white border-0 font-semibold px-3 py-1 capitalize">
                            {plan.plan_type}
                          </Badge>
                        </div>
                        {plan.description && (
                          <CardDescription className="text-base mt-2 font-medium">
                            {plan.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleEditClick(plan)}
                          disabled={saving || deleting || showNewForm}
                          className="border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleDeleteClick(plan)}
                          disabled={saving || deleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-600 hover:border-red-700 font-semibold"
                        >
                          {deleting && planToDelete?.id === plan.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-base font-bold text-[#0a3d5c] mb-1">User Type</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {plan.user_type || 'All User Types'}
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#0a3d5c] mb-1">Country</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {plan.country || 'All Countries'}
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#0a3d5c] mb-1">Monthly Price</p>
                        <p className="text-lg font-semibold text-gray-700 flex items-center gap-1">
                          <DollarSign className="h-5 w-5" />
                          {plan.monthly_price.toFixed(2)} {plan.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#0a3d5c] mb-1">Billing Period</p>
                        <p className="text-lg font-semibold text-gray-700">Monthly</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the pricing plan
                  {planToDelete && (
                    <span className="font-semibold text-[#0a3d5c]"> "{planToDelete.plan_name}"</span>
                  )}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AdminLayout>
  );
};

interface PricingPlanFormProps {
  plan?: PricingPlan;
  onSave: (plan: Partial<PricingPlan>) => void;
  onCancel: () => void;
  saving: boolean;
}

const PricingPlanForm: React.FC<PricingPlanFormProps> = ({ plan, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    plan_name: plan?.plan_name || '',
    plan_type: plan?.plan_type || 'subscription',
    user_type: plan?.user_type || null,
    country: plan?.country || null,
    monthly_price: plan?.monthly_price || 0.00,
    currency: plan?.currency || 'USD',
    description: plan?.description || '',
    is_active: plan?.is_active !== undefined ? plan.is_active : true,
  });
  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      // Ensure monthly_price is a number
      const monthlyPrice = typeof plan.monthly_price === 'number' 
        ? plan.monthly_price 
        : parseFloat(String(plan.monthly_price || 0));
      
      setFormData({
        plan_name: plan.plan_name || '',
        plan_type: plan.plan_type || 'subscription',
        user_type: plan.user_type || null,
        country: plan.country || null,
        monthly_price: isNaN(monthlyPrice) ? 0 : monthlyPrice,
        currency: plan.currency || 'USD',
        description: plan.description || '',
        is_active: plan.is_active !== undefined ? plan.is_active : true,
      });
    } else {
      // Reset to defaults for new plan
      setFormData({
        plan_name: '',
        plan_type: 'subscription',
        user_type: null,
        country: null,
        monthly_price: 0,
        currency: 'USD',
        description: '',
        is_active: true,
      });
    }
  }, [plan?.id]); // Use plan.id to properly detect when editing a different plan


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Additional client-side validation
    if (!formData.plan_name || !formData.plan_name.trim()) {
      return;
    }
    
    if (!formData.plan_type) {
      return;
    }
    
    // Ensure monthly_price is a valid number
    const monthlyPrice = typeof formData.monthly_price === 'string' 
      ? parseFloat(formData.monthly_price) 
      : formData.monthly_price;
    
    if (!monthlyPrice || monthlyPrice <= 0 || isNaN(monthlyPrice)) {
      return;
    }
    
    if (!formData.currency) {
      return;
    }
    
    // Prepare data with proper types
    const planData: Partial<PricingPlan> = {
      ...formData,
      monthly_price: monthlyPrice, // Ensure it's a number
      id: plan?.id,
    };
    
    // Call the save handler
    onSave(planData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="plan_name" className="text-sm font-medium">
            Plan Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="plan_name"
            value={formData.plan_name}
            onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
            required
            placeholder="e.g., Monthly Subscription - Inventor"
            className="w-full border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan_type" className="text-sm font-medium">
            Plan Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.plan_type || ''}
            onValueChange={(value) => setFormData({ ...formData, plan_type: value })}
          >
            <SelectTrigger id="plan_type" className="w-full border border-[#0a3d5c] focus:border-[#083146]">
              <SelectValue placeholder="Select plan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="advertising">Advertising</SelectItem>
              <SelectItem value="logo">Logo</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_type" className="text-sm font-medium">User Type</Label>
          <Select
            value={formData.user_type || 'all'}
            onValueChange={(value) => setFormData({ ...formData, user_type: value === 'all' ? null : value })}
          >
            <SelectTrigger id="user_type" className="w-full border border-[#0a3d5c] focus:border-[#083146]">
              <SelectValue placeholder="Select user type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All User Types</SelectItem>
              <SelectItem value="Inventor">Inventor</SelectItem>
              <SelectItem value="StartUp">StartUp</SelectItem>
              <SelectItem value="Company">Company</SelectItem>
              <SelectItem value="Investor">Investor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
          <Input
            id="country"
            value={formData.country || ''}
            onChange={(e) => setFormData({ ...formData, country: e.target.value || null })}
            placeholder="Leave empty for all countries"
            className="w-full border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_price" className="text-sm font-medium">
            Monthly Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="monthly_price"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.monthly_price || ''}
            onChange={(e) => {
              const value = e.target.value;
              // Parse the value as a float
              if (value === '' || value === '.') {
                // Allow empty or just decimal point during typing
                setFormData({ ...formData, monthly_price: 0 });
              } else {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue >= 0) {
                  setFormData({ ...formData, monthly_price: numValue });
                }
              }
            }}
            onBlur={(e) => {
              // Ensure value is always a valid number on blur
              const value = parseFloat(e.target.value);
              if (isNaN(value) || value <= 0) {
                // Reset to previous valid value or default
                const prevValue = formData.monthly_price && formData.monthly_price > 0 
                  ? formData.monthly_price 
                  : 1;
                setFormData({ ...formData, monthly_price: prevValue });
              } else {
                setFormData({ ...formData, monthly_price: value });
              }
            }}
            required
            placeholder="0.00"
            className="w-full border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium">
            Currency <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.currency || 'USD'}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger id="currency" className="w-full border border-[#0a3d5c] focus:border-[#083146]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          rows={3}
          placeholder="Describe this pricing plan..."
          className="w-full border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c]"
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 rounded border border-[#0a3d5c] text-[#0a3d5c] focus:ring-1 focus:ring-[#0a3d5c]"
        />
        <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
          Mark as active
        </Label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-[#0a3d5c]">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={saving || !formData.plan_name?.trim() || !formData.plan_type || !formData.currency || !formData.monthly_price || formData.monthly_price <= 0} 
          className="flex-1 bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {plan ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {plan ? 'Update Plan' : 'Create Plan'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AdminPricing;
