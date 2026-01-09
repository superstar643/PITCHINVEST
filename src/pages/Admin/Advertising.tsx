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
import { Upload, Trash2, Image as ImageIcon, Loader2, Plus, Edit, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';

interface AdvertisingAsset {
  id: string;
  asset_type: 'banner' | 'logo';
  company_name: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const AdminAdvertising: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<AdvertisingAsset[]>([]);
  const [editingAsset, setEditingAsset] = useState<AdvertisingAsset | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AdvertisingAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    asset_type: 'banner' as 'banner' | 'logo',
    company_name: '',
    link_url: '',
    is_active: true,
    display_order: 0,
    image_file: null as File | null,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
    }

    if (isAdmin && !adminLoading) {
      loadAssets();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      // Note: You'll need to create an 'advertising_assets' table in Supabase
      // For now, this is a placeholder that will work once the table exists
      const { data, error } = await supabase
        .from('advertising_assets')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') {
        // Table doesn't exist yet - that's okay, we'll show empty state
        console.warn('Advertising assets table may not exist yet:', error);
        setAssets([]);
        return;
      }

      setAssets((data || []) as AdvertisingAsset[]);
    } catch (error: any) {
      console.error('Error loading advertising assets:', error);
      if (error.code !== '42P01') {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load advertising assets',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      setFormData({ ...formData, image_file: file });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `advertising/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Company name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!editingAsset && !formData.image_file) {
      toast({
        title: 'Validation Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      let imageUrl = editingAsset?.image_url || '';

      // Upload new image if provided
      if (formData.image_file) {
        imageUrl = await uploadImage(formData.image_file);
      }

      const assetData = {
        asset_type: formData.asset_type,
        company_name: formData.company_name.trim(),
        image_url: imageUrl,
        link_url: formData.link_url.trim() || null,
        is_active: formData.is_active,
        display_order: formData.display_order || 0,
        updated_at: new Date().toISOString(),
      };

      if (editingAsset) {
        // Update existing asset
        const { error } = await supabase
          .from('advertising_assets')
          .update(assetData)
          .eq('id', editingAsset.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Advertising asset updated successfully',
        });
      } else {
        // Create new asset
        const { error } = await supabase
          .from('advertising_assets')
          .insert([{
            ...assetData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Advertising asset created successfully',
        });
      }

      // Reset form
      setFormData({
        asset_type: 'banner',
        company_name: '',
        link_url: '',
        is_active: true,
        display_order: 0,
        image_file: null,
      });
      setEditingAsset(null);
      setShowNewForm(false);
      await loadAssets();
    } catch (error: any) {
      console.error('Error saving advertising asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save advertising asset',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (asset: AdvertisingAsset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('advertising_assets')
        .delete()
        .eq('id', assetToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Advertising asset deleted successfully',
      });

      await loadAssets();
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error: any) {
      console.error('Error deleting advertising asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete advertising asset',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (asset: AdvertisingAsset) => {
    setEditingAsset(asset);
    setShowNewForm(true);
    setFormData({
      asset_type: asset.asset_type,
      company_name: asset.company_name,
      link_url: asset.link_url || '',
      is_active: asset.is_active,
      display_order: asset.display_order,
      image_file: null,
    });
  };

  const handleCancel = () => {
    setShowNewForm(false);
    setEditingAsset(null);
    setFormData({
      asset_type: 'banner',
      company_name: '',
      link_url: '',
      is_active: true,
      display_order: 0,
      image_file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (adminLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-4xl font-bold text-[#0a3d5c] mb-2">Advertising Management</h1>
              <p className="text-lg text-gray-700">Upload and manage banners and logos for advertising companies</p>
            </div>
            <Button
              onClick={() => {
                setShowNewForm(true);
                setEditingAsset(null);
                setFormData({
                  asset_type: 'banner',
                  company_name: '',
                  link_url: '',
                  is_active: true,
                  display_order: 0,
                  image_file: null,
                });
              }}
              className="bg-[#0a3d5c] hover:bg-[#083146] text-white font-semibold border border-[#0a3d5c] hover:border-[#083146]"
              disabled={saving || deleting}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Asset
            </Button>
          </div>
        </div>

        {/* New/Edit Form */}
        {(showNewForm || editingAsset) && (
          <Card className="mb-6 border border-[#0a3d5c]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#0a3d5c]">
                {editingAsset ? 'Edit Advertising Asset' : 'New Advertising Asset'}
              </CardTitle>
              <CardDescription className="text-base">
                {editingAsset ? 'Update the advertising asset details below' : 'Fill in the details to create a new advertising asset'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="asset_type" className="text-base font-semibold">
                      Asset Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.asset_type}
                      onValueChange={(value: 'banner' | 'logo') => setFormData({ ...formData, asset_type: value })}
                    >
                      <SelectTrigger id="asset_type" className="border border-[#0a3d5c] focus:border-[#083146] font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="logo">Logo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-base font-semibold">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Enter company name"
                      className="border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link_url" className="text-base font-semibold">Link URL</Label>
                    <Input
                      id="link_url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="https://example.com"
                      className="border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order" className="text-base font-semibold">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_file" className="text-base font-semibold">
                    {editingAsset ? 'New Image (optional)' : 'Image File'} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image_file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium"
                    />
                    {formData.image_file && (
                      <span className="text-sm text-gray-700 font-medium">{formData.image_file.name}</span>
                    )}
                    {editingAsset && editingAsset.image_url && !formData.image_file && (
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[#0a3d5c]" />
                        <span className="text-sm text-gray-700 font-medium">Current image in use</span>
                      </div>
                    )}
                  </div>
                  {editingAsset && editingAsset.image_url && (
                    <div className="mt-2">
                      <img src={editingAsset.image_url} alt="Current" className="max-w-xs h-32 object-contain border border-gray-300 rounded" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 rounded border border-[#0a3d5c] text-[#0a3d5c] focus:ring-1 focus:ring-[#0a3d5c]"
                  />
                  <Label htmlFor="is_active" className="text-base font-semibold cursor-pointer">
                    Mark as active
                  </Label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-[#0a3d5c]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
                    disabled={saving || uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || uploading || !formData.company_name.trim() || (!editingAsset && !formData.image_file)}
                    className="flex-1 bg-[#0a3d5c] hover:bg-[#083146] text-white font-semibold border border-[#0a3d5c] hover:border-[#083146] disabled:opacity-50"
                  >
                    {saving || uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {uploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        {editingAsset ? 'Update Asset' : 'Create Asset'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets List */}
        {assets.length === 0 ? (
          <Card className="border border-[#0a3d5c]">
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-700 mb-2">No advertising assets found</p>
              <p className="text-base text-gray-500 mb-4">Create your first advertising asset to get started</p>
              <Button
                onClick={() => setShowNewForm(true)}
                className="bg-[#0a3d5c] hover:bg-[#083146] text-white font-semibold border border-[#0a3d5c] hover:border-[#083146]"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Asset
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => {
              const assetTypeColors: Record<string, string> = {
                'banner': 'border-purple-600 hover:border-purple-700',
                'logo': 'border-indigo-600 hover:border-indigo-700',
              };
              const borderColor = assetTypeColors[asset.asset_type] || 'border-[#0a3d5c] hover:border-[#083146]';
              return (
              <Card key={asset.id} className={`border ${borderColor} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-bold text-[#0a3d5c]">{asset.company_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        className={
                          asset.is_active
                            ? 'bg-green-600 text-white border-0 font-semibold'
                            : 'bg-gray-500 text-white border-0 font-semibold'
                        }
                      >
                        {asset.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="bg-blue-600 text-white border-0 font-semibold capitalize">
                        {asset.asset_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <img
                      src={asset.image_url}
                      alt={asset.company_name}
                      className="w-full h-32 object-contain border border-gray-300 rounded"
                    />
                  </div>
                  {asset.link_url && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Link:</span>{' '}
                      <a href={asset.link_url} target="_blank" rel="noopener noreferrer" className="text-[#0a3d5c] hover:underline">
                        {asset.link_url}
                      </a>
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="font-semibold">Order:</span> {asset.display_order}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(asset)}
                      className="flex-1 border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
                      disabled={saving || deleting}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(asset)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-600 hover:border-red-700 font-semibold"
                      disabled={saving || deleting}
                    >
                      {deleting && assetToDelete?.id === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
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
              <AlertDialogTitle className="text-xl font-bold">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                This action cannot be undone. This will permanently delete the advertising asset
                {assetToDelete && (
                  <span className="font-semibold text-[#0a3d5c]"> "{assetToDelete.company_name}"</span>
                )}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting} className="font-semibold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 font-semibold"
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

export default AdminAdvertising;
