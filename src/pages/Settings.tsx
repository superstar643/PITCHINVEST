import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserProfile, type ProfileData } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Save,
  Upload,
  X,
  Camera,
  Shield,
  CreditCard
} from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { getSortedCountries, getCountryByCode } from '@/lib/countries';
import { getCachedGeolocation } from '@/lib/geolocation';
import { SearchableCountrySelect } from '@/components/ui/searchable-country-select';
import SubscriptionManagement from '@/components/SubscriptionManagement';

// Use comprehensive countries list
const countries = getSortedCountries();

const USE_STATIC_PREVIEW = false; // set true only for local UI preview

const Settings: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // Check URL for tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['account', 'profile', 'media', 'security', 'subscription'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1'); // Default to US
  const [telephoneError, setTelephoneError] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(null); // Store detected ISO country code

  // Form states
  const [formData, setFormData] = useState({
    // Account settings
    fullName: '',
    personalEmail: '',
    telephone: '',
    country: '',
    city: '',
    photoUrl: '',
    coverImageUrl: '',
    // Profile details
    projectName: '',
    projectCategory: '',
    companyName: '',
    companyNIF: '',
    companyTelephone: '',
    smartMoney: '',
    totalSaleOfProject: '',
    investmentPreferences: '',
    // Inventor specific
    inventorName: '',
    licenseNumber: '',
    releaseDate: '',
    initialLicenseValue: '',
    exploitationLicenseRoyalty: '',
    patentSale: '',
    investorsCount: '',
    // Commercial proposals
    equityCapitalPercentage: '',
    equityTotalValue: '',
    licenseFee: '',
    licensingRoyaltiesPercentage: '',
    franchiseeInvestment: '',
    monthlyRoyalties: '',
    patentUpfrontFee: '',
    patentRoyalties: '',
    // Media
    description: '',
    factSheet: '',
    technicalSheet: '',
  });

  // File states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isOAuthUser, setIsOAuthUser] = useState(false); // Track if user signed in via OAuth (no password)

  const loadProfileData = useCallback(async () => {
    if (USE_STATIC_PREVIEW) {
      const mock: ProfileData = {
        user: {
          id: 'demo-user',
          user_type: 'Inventor',
          full_name: 'Demo User',
          personal_email: 'demo@example.com',
          telephone: '+1 234 567 890',
          country: 'USA',
          city: 'New York',
          cover_image_url: '',
          photo_url: '',
          created_at: new Date().toISOString(),
        },
        profile: {
          id: 'demo-profile',
          user_id: 'demo-user',
          project_name: 'Demo Project',
          project_category: 'Technology',
          company_name: 'Demo Company',
          company_nif: '123456789',
          company_telephone: '+1 987 654 321',
          smart_money: 'Yes',
          total_sale_of_project: '1,000,000',
          investment_preferences: 'Equity, Licensing',
          inventor_name: 'Demo Inventor',
          license_number: 'LIC-2025-001',
          release_date: '2025-12-31',
          initial_license_value: '250,000',
          exploitation_license_royalty: '5%',
          patent_sale: 'Available',
          investors_count: '3',
          created_at: new Date().toISOString(),
        },
        proposals: {
          id: 'demo-proposal',
          user_id: 'demo-user',
          equity_capital_percentage: '15%',
          equity_total_value: '500,000',
          license_fee: '50,000',
          licensing_royalties_percentage: '3%',
          franchisee_investment: '200,000',
          monthly_royalties: '5,000',
          patent_upfront_fee: '80,000',
          patent_royalties: '4%',
          created_at: new Date().toISOString(),
        },
        materials: {
          id: 'demo-materials',
          user_id: 'demo-user',
          pitch_video_url: null,
          photos_urls: [],
          pitch_videos_urls: [],
          description: 'Demo description text here.',
          fact_sheet: 'Demo fact sheet content.',
          technical_sheet: 'Demo technical sheet content.',
          created_at: new Date().toISOString(),
        },
      };
      setProfileData(mock);
      setFormData(prev => ({
        ...prev,
        fullName: mock.user!.full_name,
        personalEmail: mock.user!.personal_email,
        telephone: mock.user!.telephone || '',
        country: mock.user!.country || '',
        city: mock.user!.city || '',
        photoUrl: mock.user!.photo_url || '',
        coverImageUrl: mock.user!.cover_image_url || '',
        projectName: mock.profile!.project_name || '',
        projectCategory: mock.profile!.project_category || '',
        companyName: mock.profile!.company_name || '',
        companyNIF: mock.profile!.company_nif || '',
        companyTelephone: mock.profile!.company_telephone || '',
        smartMoney: mock.profile!.smart_money || '',
        totalSaleOfProject: mock.profile!.total_sale_of_project || '',
        investmentPreferences: mock.profile!.investment_preferences || '',
        inventorName: mock.profile!.inventor_name || '',
        licenseNumber: mock.profile!.license_number || '',
        releaseDate: mock.profile!.release_date || '',
        initialLicenseValue: mock.profile!.initial_license_value || '',
        exploitationLicenseRoyalty: mock.profile!.exploitation_license_royalty || '',
        patentSale: mock.profile!.patent_sale || '',
        investorsCount: mock.profile!.investors_count || '',
        equityCapitalPercentage: mock.proposals!.equity_capital_percentage || '',
        equityTotalValue: mock.proposals!.equity_total_value || '',
        licenseFee: mock.proposals!.license_fee || '',
        licensingRoyaltiesPercentage: mock.proposals!.licensing_royalties_percentage || '',
        franchiseeInvestment: mock.proposals!.franchisee_investment || '',
        monthlyRoyalties: mock.proposals!.monthly_royalties || '',
        patentUpfrontFee: mock.proposals!.patent_upfront_fee || '',
        patentRoyalties: mock.proposals!.patent_royalties || '',
        description: mock.materials!.description || '',
        factSheet: mock.materials!.fact_sheet || '',
        technicalSheet: mock.materials!.technical_sheet || '',
      }));
      setPhotoPreview(mock.user!.photo_url || '');
      setCoverImagePreview(mock.user!.cover_image_url || '');
      setLoading(false);
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchUserProfile(user.id);
      setProfileData(data);

      // Populate form with existing data
      if (data.user) {
        setFormData(prev => ({
          ...prev,
          fullName: data.user!.full_name || '',
          personalEmail: data.user!.personal_email || '',
          telephone: data.user!.telephone || '',
          country: data.user!.country || '',
          city: data.user!.city || '',
          photoUrl: data.user!.photo_url || '',
          coverImageUrl: data.user!.cover_image_url || '',
        }));
        setPhotoPreview(data.user!.photo_url || '');
        setCoverImagePreview(data.user!.cover_image_url || '');
        
        // Detect phone country code from country or default to +1
        if (data.user!.country) {
          const countryMatch = countries.find(c => c.name === data.user!.country);
          if (countryMatch) {
            setPhoneCountryCode(countryMatch.phoneCode);
          }
        }
      }

      if (data.profile) {
        setFormData(prev => ({
          ...prev,
          projectName: data.profile!.project_name || '',
          projectCategory: data.profile!.project_category || '',
          companyName: data.profile!.company_name || '',
          companyNIF: data.profile!.company_nif || '',
          companyTelephone: data.profile!.company_telephone || '',
          smartMoney: data.profile!.smart_money || '',
          totalSaleOfProject: data.profile!.total_sale_of_project || '',
          investmentPreferences: data.profile!.investment_preferences || '',
          inventorName: data.profile!.inventor_name || '',
          licenseNumber: data.profile!.license_number || '',
          releaseDate: data.profile!.release_date || '',
          initialLicenseValue: data.profile!.initial_license_value || '',
          exploitationLicenseRoyalty: data.profile!.exploitation_license_royalty || '',
          patentSale: data.profile!.patent_sale || '',
          investorsCount: data.profile!.investors_count || '',
        }));
      }

      if (data.proposals) {
        setFormData(prev => ({
          ...prev,
          equityCapitalPercentage: data.proposals!.equity_capital_percentage || '',
          equityTotalValue: data.proposals!.equity_total_value || '',
          licenseFee: data.proposals!.license_fee || '',
          licensingRoyaltiesPercentage: data.proposals!.licensing_royalties_percentage || '',
          franchiseeInvestment: data.proposals!.franchisee_investment || '',
          monthlyRoyalties: data.proposals!.monthly_royalties || '',
          patentUpfrontFee: data.proposals!.patent_upfront_fee || '',
          patentRoyalties: data.proposals!.patent_royalties || '',
        }));
      }

      if (data.materials) {
        setFormData(prev => ({
          ...prev,
          description: data.materials!.description || '',
          factSheet: data.materials!.fact_sheet || '',
          technicalSheet: data.materials!.technical_sheet || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Use ref to track if profile data has been loaded (refs don't trigger re-renders)
  const profileDataLoadedRef = useRef(false);

  useEffect(() => {
    // In preview mode, skip auth and load static data
    if (USE_STATIC_PREVIEW) {
      if (!profileDataLoadedRef.current) {
      loadProfileData();
        profileDataLoadedRef.current = true;
      }
      return;
    }

    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Only redirect if auth has finished loading and there's no user
    if (!user) {
      navigate('/login');
      return;
    }

    // Only load profile data once when user is available and data hasn't been loaded yet
    // This prevents form data from being reset when component re-renders (e.g., on window focus)
    if (!profileDataLoadedRef.current) {
    loadProfileData();
      profileDataLoadedRef.current = true;
    }
  }, [user, authLoading, navigate, loadProfileData]);

  // Check if user is OAuth-only (no password)
  useEffect(() => {
    if (user) {
      // Check if user signed in via OAuth (Google or LinkedIn)
      // OAuth users have app_metadata.provider set and typically don't have a password
      const provider = user.app_metadata?.provider;
      const isOAuth = provider === 'google' || provider === 'linkedin' || provider === 'linkedin_oidc';
      setIsOAuthUser(isOAuth);
    }
  }, [user]);

  // Auto-detect location on mount if country/city is not set
  useEffect(() => {
    if (!USE_STATIC_PREVIEW && user && !formData.country && !geolocationLoading) {
      setGeolocationLoading(true);
      getCachedGeolocation()
        .then((geoData) => {
          if (geoData && geoData.countryCode) {
            const detectedCountry = getCountryByCode(geoData.countryCode);
            if (detectedCountry && !formData.country) {
              // Auto-select detected country
              setFormData((prev) => ({
                ...prev,
                country: detectedCountry.name,
                city: geoData.city || prev.city,
              }));
              // Store the detected country code for proper flag display (important for +1 US/Canada)
              setDetectedCountryCode(detectedCountry.code);
              // Auto-select phone country code
              setPhoneCountryCode(detectedCountry.phoneCode);
           
            }
          }
        })
        .catch((error) => {
          console.warn('Geolocation detection failed:', error);
        })
        .finally(() => {
          setGeolocationLoading(false);
        });
    }
  }, [user, formData.country, geolocationLoading, USE_STATIC_PREVIEW]);

  // Safety: if user exists but loading hangs due to network, stop spinner
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [user]);

  // Prevent body overflow changes when select dropdowns are open
  useEffect(() => {
    if (isSelectOpen) {
      // Lock both html and body to prevent horizontal scroll and layout shift
      const html = document.documentElement;
      const body = document.body;
      
      // Save original values
      const originalHtmlOverflow = html.style.overflow;
      const originalHtmlOverflowX = html.style.overflowX;
      const originalHtmlMaxWidth = html.style.maxWidth;
      const originalBodyOverflow = body.style.overflow;
      const originalBodyOverflowX = body.style.overflowX;
      const originalBodyMaxWidth = body.style.maxWidth;
      const originalBodyPaddingRight = body.style.paddingRight;
      const originalBodyWidth = body.style.width;
      
      // Force no horizontal overflow
      html.style.overflowX = 'hidden';
      html.style.maxWidth = '100vw';
      body.style.overflowX = 'hidden';
      body.style.maxWidth = '100vw';
      body.style.width = '100%';
      
      // Keep vertical scroll working
      if (!html.style.overflow || html.style.overflow === 'visible') {
        html.style.overflow = 'auto';
      }
      if (!body.style.overflow || body.style.overflow === 'visible') {
        body.style.overflow = 'auto';
      }
      
      // Calculate scrollbar width if it exists
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Compensate for scrollbar to prevent layout shift (but don't add padding if causing issues)
      // The scrollbar compensation might actually cause the shift, so let's skip it
      
      return () => {
        // Restore original values
        html.style.overflow = originalHtmlOverflow || '';
        html.style.overflowX = originalHtmlOverflowX || '';
        html.style.maxWidth = originalHtmlMaxWidth || '';
        body.style.overflow = originalBodyOverflow || '';
        body.style.overflowX = originalBodyOverflowX || '';
        body.style.maxWidth = originalBodyMaxWidth || '';
        body.style.width = originalBodyWidth || '';
        body.style.paddingRight = originalBodyPaddingRight || '';
      };
    }
  }, [isSelectOpen]);

  // Phone number validation function
  const validatePhoneNumber = (phone: string, countryCode: string): string => {
    if (!phone.trim()) {
      return '';
    }
    
    // Remove spaces, dashes, parentheses, and other formatting characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Phone number must contain only digits';
    }
    
    // Country-specific validation
    const minLength: { [key: string]: number } = {
      '+1': 10,    // US/Canada
      '+33': 9,    // France
      '+34': 9,    // Spain
      '+39': 9,    // Italy
      '+44': 10,   // UK
      '+49': 10,   // Germany
      '+55': 10,   // Brazil
      '+351': 9,   // Portugal
    };
    
    const maxLength: { [key: string]: number } = {
      '+1': 10,
      '+33': 9,
      '+34': 9,
      '+39': 9,
      '+44': 10,
      '+49': 10,
      '+55': 11,
      '+351': 9,
    };
    
    const min = minLength[countryCode] || 7;
    const max = maxLength[countryCode] || 15;
    
    if (cleanPhone.length < min) {
      return `Phone number must be at least ${min} digits`;
    }
    if (cleanPhone.length > max) {
      return `Phone number must be at most ${max} digits`;
    }
    
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time phone validation
    if (field === 'telephone') {
      const phoneError = validatePhoneNumber(value, phoneCountryCode);
      setTelephoneError(phoneError);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Photo must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Cover image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validation - different for OAuth users vs password users
    if (isOAuthUser) {
      // OAuth users: only need new password and confirmation
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('New password and confirmation are required');
        return;
      }
    } else {
      // Password users: need all fields including current password
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('All password fields are required');
        return;
      }
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError('');

      // For non-OAuth users, verify the current password first
      if (!isOAuthUser) {
        const userEmail = user.email || formData.personalEmail;
        if (!userEmail) {
          throw new Error('Email address not found. Please update your email in Account settings.');
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: passwordData.currentPassword,
        });

        if (signInError) {
          // Map Supabase error codes to user-friendly messages
          if (signInError.message.includes('Invalid login credentials') || 
              signInError.message.includes('invalid') ||
              signInError.message.includes('Email not confirmed')) {
            throw new Error('Current password is incorrect');
          }
          throw signInError;
        }
      }

      // Update password (works for both OAuth users creating password and password users changing it)
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) {
        // Map Supabase error codes to user-friendly messages
        let errorMessage = 'Failed to update password. Please try again.';
        
        if (updateError.message.includes('same password') || updateError.message.includes('identical')) {
          errorMessage = 'New password must be different from your current password';
        } else if (updateError.message.includes('weak') || updateError.message.includes('strength')) {
          errorMessage = 'Password is too weak. Please choose a stronger password';
        } else if (updateError.message.includes('network') || updateError.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again';
        } else if (updateError.message) {
          errorMessage = updateError.message;
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: 'Success',
        description: isOAuthUser ? 'Password created successfully' : 'Password updated successfully',
      });

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Update OAuth status after password is created
      if (isOAuthUser) {
        setIsOAuthUser(false);
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.toString && error.toString().includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again';
      }
      
      setPasswordError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Upload new images if selected
      let photoUrl = formData.photoUrl;
      let coverImageUrl = formData.coverImageUrl;

      if (photoFile) {
        const { uploadFile } = await import('@/lib/storage');
        const result = await uploadFile('user-photos', photoFile, user.id);
        if (result.url) {
          photoUrl = result.url;
        } else if (result.error) {
          throw new Error(`Failed to upload photo: ${result.error.message || 'Unknown error'}`);
        }
      }

      if (coverImageFile) {
        const { uploadFile } = await import('@/lib/storage');
        const result = await uploadFile('cover-images', coverImageFile, user.id);
        if (result.url) {
          coverImageUrl = result.url;
        } else if (result.error) {
          throw new Error(`Failed to upload cover image: ${result.error.message || 'Unknown error'}`);
        }
      }

      // Update users table (email is not updated as it cannot be changed)
      // If photoUrl is empty string, set it to null to remove the photo
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          // personal_email is intentionally excluded - email cannot be changed
          telephone: formData.telephone || null,
          country: formData.country || null,
          city: formData.city || null,
          photo_url: photoUrl || null,
          cover_image_url: coverImageUrl || null,
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update or insert profiles table (upsert)
        const { error: profileError } = await supabase
          .from('profiles')
        .upsert({
          user_id: user.id,
          project_name: formData.projectName || null,
          project_category: formData.projectCategory || null,
          company_name: formData.companyName || null,
          company_nif: formData.companyNIF || null,
          company_telephone: formData.companyTelephone || null,
          smart_money: formData.smartMoney || null,
          total_sale_of_project: formData.totalSaleOfProject || null,
          investment_preferences: formData.investmentPreferences || null,
          inventor_name: formData.inventorName || null,
          license_number: formData.licenseNumber || null,
          release_date: formData.releaseDate || null,
          initial_license_value: formData.initialLicenseValue || null,
          exploitation_license_royalty: formData.exploitationLicenseRoyalty || null,
          patent_sale: formData.patentSale || null,
          investors_count: formData.investorsCount || null,
        }, {
          onConflict: 'user_id'
        });

        if (profileError) throw profileError;

      // Update or insert commercial_proposals table (upsert)
      // Only upsert if there's at least one field with data
      const hasProposalData = 
        formData.equityCapitalPercentage || 
        formData.equityTotalValue || 
        formData.licenseFee || 
        formData.licensingRoyaltiesPercentage || 
        formData.franchiseeInvestment || 
        formData.monthlyRoyalties;

      if (hasProposalData) {
        const { error: proposalsError } = await supabase
          .from('commercial_proposals')
          .upsert({
            user_id: user.id,
            equity_capital_percentage: formData.equityCapitalPercentage || null,
            equity_total_value: formData.equityTotalValue || null,
            license_fee: formData.licenseFee || null,
            licensing_royalties_percentage: formData.licensingRoyaltiesPercentage || null,
            franchisee_investment: formData.franchiseeInvestment || null,
            monthly_royalties: formData.monthlyRoyalties || null,
          }, {
            onConflict: 'user_id'
          });

        if (proposalsError) throw proposalsError;
      }

      // Update or insert pitch_materials table (upsert)
        const { error: materialsError } = await supabase
          .from('pitch_materials')
        .upsert({
          user_id: user.id,
          description: formData.description || null,
          fact_sheet: formData.factSheet || null,
          technical_sheet: formData.technicalSheet || null,
        }, {
          onConflict: 'user_id'
        });

        if (materialsError) throw materialsError;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      // Clear file states after successful upload
      setPhotoFile(null);
      setCoverImageFile(null);
      
      // Update previews with new URLs
      if (photoUrl) {
        setPhotoPreview(photoUrl);
        setFormData(prev => ({ ...prev, photoUrl }));
      }
      if (coverImageUrl) {
        setCoverImagePreview(coverImageUrl);
        setFormData(prev => ({ ...prev, coverImageUrl }));
      }

      // Reload profile data after successful save
      profileDataLoadedRef.current = false; // Reset flag before reloading
      await loadProfileData();
      profileDataLoadedRef.current = true; // Mark as loaded after successful reload
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // If no user after auth settled, don't render (useEffect will redirect)
  if (!user && !authLoading) {
    return null;
  }

  const userType = profile?.user_type || profileData?.user?.user_type;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 overflow-x-hidden w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0a3d5c] mb-2">Settings</h1>
          <p className="text-gray-600 text-base">Manage your account settings and profile information</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white rounded-full shadow-sm border border-gray-200 p-1 h-auto">
            <TabsTrigger 
              value="account" 
              className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all data-[state=active]:bg-[#0a3d5c] data-[state=active]:text-white data-[state=active]:shadow-md hover:text-[#0a3d5c]"
            >
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all data-[state=active]:bg-[#0a3d5c] data-[state=active]:text-white data-[state=active]:shadow-md hover:text-[#0a3d5c]"
            >
              <FileText className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all data-[state=active]:bg-[#0a3d5c] data-[state=active]:text-white data-[state=active]:shadow-md hover:text-[#0a3d5c]"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Media</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all data-[state=active]:bg-[#0a3d5c] data-[state=active]:text-white data-[state=active]:shadow-md hover:text-[#0a3d5c]"
            >
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all data-[state=active]:bg-[#0a3d5c] data-[state=active]:text-white data-[state=active]:shadow-md hover:text-[#0a3d5c]"
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
                <CardTitle className="text-white text-2xl">Account Information</CardTitle>
                <CardDescription className="text-white/90">Update your basic account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Profile Photo */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Profile Photo</Label>
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      {photoPreview ? (
                        <div className="relative group">
                        <img
                          src={photoPreview}
                          alt="Profile"
                            className="w-32 h-32 rounded-full object-cover shadow-lg"
                        />
                          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPhotoPreview('');
                              setPhotoFile(null);
                              setFormData(prev => ({ ...prev, photoUrl: '' }));
                              // Reset the file input
                              const fileInput = document.getElementById('profile-photo-input') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                            title="Delete profile photo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0a3d5c] to-[#062a3d] flex items-center justify-center shadow-lg">
                          <Camera className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                          className="cursor-pointer border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all"
                          id="profile-photo-input"
                        />
                        <label
                          htmlFor="profile-photo-input"
                          className="absolute inset-0 cursor-pointer"
                      />
                      </div>
                      <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Cover Image</Label>
                  <div className="space-y-3">
                    {coverImagePreview ? (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                        <img
                          src={coverImagePreview}
                          alt="Cover"
                          className="w-full h-56 object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCoverImagePreview('');
                            setCoverImageFile(null);
                            setFormData(prev => ({ ...prev, coverImageUrl: '' }));
                            // Reset the file input
                            const fileInput = document.getElementById('cover-image-input') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = '';
                            }
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-all z-10"
                          title="Delete cover image"
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-56 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#0a3d5c] transition-colors">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">No cover image</p>
                          <p className="text-xs text-gray-400 mt-1">Click below to upload</p>
                        </div>
                      </div>
                    )}
                    <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                        className="cursor-pointer border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all"
                        id="cover-image-input"
                    />
                      <label
                        htmlFor="cover-image-input"
                        className="absolute inset-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <Separator />

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="personalEmail" className="text-sm font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                    placeholder="your.email@example.com"
                    readOnly
                    disabled
                    className="border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Telephone */}
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                  <div className={`flex items-center gap-0 border rounded-lg overflow-hidden focus-within:ring-2 transition ${
                    telephoneError 
                      ? 'border-red-500 focus-within:ring-red-500/20 focus-within:border-red-500' 
                      : 'border-gray-300 focus-within:ring-[#0a3d5c]/20 focus-within:border-[#0a3d5c]'
                  }`}>
                    {/* Country Code Selector */}
                    <SearchableCountrySelect
                      countries={countries}
                      value={phoneCountryCode}
                      onValueChange={(value) => {
                        setPhoneCountryCode(value);
                        // Re-validate when country code changes
                        if (formData.telephone) {
                          const phoneError = validatePhoneNumber(formData.telephone, value);
                          setTelephoneError(phoneError);
                        }
                      }}
                      type="phone"
                      placeholder="+1"
                      preferredCountryCode={
                        formData.country 
                          ? countries.find(c => c.name === formData.country)?.code 
                          : detectedCountryCode || undefined
                      }
                      triggerClassName="w-auto min-w-[100px] border-0 rounded-none border-r border-gray-300 rounded-l-lg focus:ring-0 focus:ring-offset-0 h-auto py-2 px-3"
                    />
                    
                    {/* Phone Number Input */}
                    <input
                    id="telephone"
                      name="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="(555) 000-0000"
                      className="flex-1 px-4 py-2 border-0 outline-none transition"
                      onFocus={(e) => {
                        e.currentTarget.parentElement?.style.setProperty('box-shadow', '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c');
                        e.currentTarget.parentElement?.style.setProperty('border-color', '#0a3d5c');
                      }}
                      onBlur={(e) => {
                        const phoneError = validatePhoneNumber(formData.telephone, phoneCountryCode);
                        setTelephoneError(phoneError);
                        if (!phoneError) {
                          e.currentTarget.parentElement?.style.setProperty('box-shadow', 'none');
                          e.currentTarget.parentElement?.style.setProperty('border-color', '#d1d5db');
                        }
                      }}
                    />
                  </div>
                  {telephoneError && (
                    <p className="mt-1 text-sm text-red-600">{telephoneError}</p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-gray-700">Country</Label>
                  <SearchableCountrySelect
                    countries={countries}
                    value={formData.country}
                    onValueChange={(value) => {
                      handleInputChange('country', value);
                      // Update phone country code when country changes
                      const countryMatch = countries.find(c => c.name === value);
                      if (countryMatch) {
                        setPhoneCountryCode(countryMatch.phoneCode);
                        // Store the country code for proper flag display in phone selector
                        setDetectedCountryCode(countryMatch.code);
                      }
                    }}
                    type="country"
                    placeholder="Select a country"
                    triggerClassName="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none transition h-auto min-h-[42px] bg-white focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c]"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter your city"
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Details Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
                <CardTitle className="text-white text-2xl">Profile Details</CardTitle>
                <CardDescription className="text-white/90">
                  Update your {userType === 'Investor' ? 'investment' : 'project'} information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Project Name */}
                {userType !== 'Investor' && (
                  <div className="space-y-2">
                    <Label htmlFor="projectName" className="text-sm font-semibold text-gray-700">Project Name</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="Enter project name"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                )}

                {/* Project Category */}
                {userType !== 'Investor' && (
                  <div className="space-y-2">
                    <Label htmlFor="projectCategory" className="text-sm font-semibold text-gray-700">Project Category</Label>
                    <Input
                      id="projectCategory"
                      value={formData.projectCategory}
                      onChange={(e) => handleInputChange('projectCategory', e.target.value)}
                      placeholder="Enter project category"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                )}

                {/* Company Information */}
                {(userType === 'StartUp' || userType === 'Company') && (
                  <>
                    <Separator className="my-6" />
                    <h3 className="font-semibold text-lg text-[#0a3d5c] mb-4">Company Information</h3>
                    <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyNIF" className="text-sm font-semibold text-gray-700">Company NIF</Label>
                      <Input
                        id="companyNIF"
                        value={formData.companyNIF}
                        onChange={(e) => handleInputChange('companyNIF', e.target.value)}
                        placeholder="Enter company NIF"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyTelephone" className="text-sm font-semibold text-gray-700">Company Telephone</Label>
                      <Input
                        id="companyTelephone"
                        value={formData.companyTelephone}
                        onChange={(e) => handleInputChange('companyTelephone', e.target.value)}
                        placeholder="Enter company telephone"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                      />
                      </div>
                      {/* Total Sale of Project - Only for Company user type */}
                      {userType === 'Company' && (
                        <div className="space-y-2">
                          <Label htmlFor="totalSaleOfProject" className="text-sm font-semibold text-gray-700">Total Sale of Project</Label>
                          <Input
                            id="totalSaleOfProject"
                            value={formData.totalSaleOfProject}
                            onChange={(e) => handleInputChange('totalSaleOfProject', e.target.value)}
                            placeholder="Enter total sale amount"
                            className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* StartUp specific */}
                {userType === 'StartUp' && (
                  <>
                    <Separator className="my-6" />
                    <h3 className="font-semibold text-lg text-[#0a3d5c] mb-4">StartUp Details</h3>
                    <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="smartMoney" className="text-sm font-semibold text-gray-700">Smart Money</Label>
                      <Input
                        id="smartMoney"
                        value={formData.smartMoney}
                        onChange={(e) => handleInputChange('smartMoney', e.target.value)}
                        placeholder="Enter smart money amount"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="totalSaleOfProject" className="text-sm font-semibold text-gray-700">Total Sale of Project</Label>
                      <Input
                        id="totalSaleOfProject"
                        value={formData.totalSaleOfProject}
                        onChange={(e) => handleInputChange('totalSaleOfProject', e.target.value)}
                        placeholder="Enter total sale amount"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                      />
                      </div>
                    </div>
                  </>
                )}

                {/* Investor specific */}
                {userType === 'Investor' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="projectCategory" className="text-sm font-semibold text-gray-700">Project Category Interest</Label>
                      <Input
                        id="projectCategory"
                        value={formData.projectCategory}
                        onChange={(e) => handleInputChange('projectCategory', e.target.value)}
                        placeholder="e.g., SaaS, E-commerce, FinTech"
                        className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investmentPreferences" className="text-sm font-semibold text-gray-700">Investment Preferences</Label>
                      <Textarea
                        id="investmentPreferences"
                        value={formData.investmentPreferences}
                        onChange={(e) => handleInputChange('investmentPreferences', e.target.value)}
                        placeholder="Describe your investment preferences"
                        rows={4}
                        className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Inventor specific */}
                {userType === 'Inventor' && (
                  <>
                    <Separator className="my-6" />
                    <h3 className="font-semibold text-lg text-[#0a3d5c] mb-4">Inventor Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inventorName" className="text-sm font-semibold text-gray-700">Inventor Name</Label>
                        <Input
                          id="inventorName"
                          value={formData.inventorName}
                          onChange={(e) => handleInputChange('inventorName', e.target.value)}
                          placeholder="Enter inventor name"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber" className="text-sm font-semibold text-gray-700">License Number</Label>
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          placeholder="Enter license number"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="releaseDate" className="text-sm font-semibold text-gray-700">Release Date</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={formData.releaseDate}
                          onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="initialLicenseValue" className="text-sm font-semibold text-gray-700">Patent Exploitation Fee</Label>
                        <Input
                          id="initialLicenseValue"
                          value={formData.initialLicenseValue}
                          onChange={(e) => handleInputChange('initialLicenseValue', e.target.value)}
                          placeholder="Enter patent exploitation fee"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exploitationLicenseRoyalty" className="text-sm font-semibold text-gray-700">Patent Exploitation Royalties</Label>
                        <Input
                          id="exploitationLicenseRoyalty"
                          value={formData.exploitationLicenseRoyalty}
                          onChange={(e) => handleInputChange('exploitationLicenseRoyalty', e.target.value)}
                          placeholder="Enter royalty percentage"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patentSale" className="text-sm font-semibold text-gray-700">Full Patent Assignment (100%)</Label>
                        <Input
                          id="patentSale"
                          value={formData.patentSale}
                          onChange={(e) => handleInputChange('patentSale', e.target.value)}
                          placeholder="Enter patent sale amount"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="investorsCount" className="text-sm font-semibold text-gray-700">Investors Count</Label>
                        <Input
                          id="investorsCount"
                          value={formData.investorsCount}
                          onChange={(e) => handleInputChange('investorsCount', e.target.value)}
                          placeholder="Enter number of investors"
                          className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Commercial Proposals - Hidden for Inventor user type */}
                {userType !== 'Inventor' && (
                  <>
                <Separator className="my-6" />
                <h3 className="font-semibold text-lg text-[#0a3d5c] mb-4">Commercial Proposals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                        <Label htmlFor="equityCapitalPercentage" className="text-sm font-semibold text-gray-700">Equity</Label>
                    <Input
                      id="equityCapitalPercentage"
                      value={formData.equityCapitalPercentage}
                      onChange={(e) => handleInputChange('equityCapitalPercentage', e.target.value)}
                      placeholder="Enter percentage"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="equityTotalValue" className="text-sm font-semibold text-gray-700">Investment Amount</Label>
                    <Input
                      id="equityTotalValue"
                      value={formData.equityTotalValue}
                      onChange={(e) => handleInputChange('equityTotalValue', e.target.value)}
                          placeholder="Enter investment amount"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="licenseFee" className="text-sm font-semibold text-gray-700">Initial Licensing Fee</Label>
                    <Input
                      id="licenseFee"
                      value={formData.licenseFee}
                      onChange={(e) => handleInputChange('licenseFee', e.target.value)}
                          placeholder="Enter initial licensing fee"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="licensingRoyaltiesPercentage" className="text-sm font-semibold text-gray-700">Royalties (%)</Label>
                    <Input
                      id="licensingRoyaltiesPercentage"
                      value={formData.licensingRoyaltiesPercentage}
                      onChange={(e) => handleInputChange('licensingRoyaltiesPercentage', e.target.value)}
                          placeholder="Enter royalties percentage"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="franchiseeInvestment" className="text-sm font-semibold text-gray-700">Franchise Fee</Label>
                    <Input
                      id="franchiseeInvestment"
                      value={formData.franchiseeInvestment}
                      onChange={(e) => handleInputChange('franchiseeInvestment', e.target.value)}
                          placeholder="Enter franchise fee"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="monthlyRoyalties" className="text-sm font-semibold text-gray-700">Royalties (%)</Label>
                    <Input
                      id="monthlyRoyalties"
                      value={formData.monthlyRoyalties}
                      onChange={(e) => handleInputChange('monthlyRoyalties', e.target.value)}
                          placeholder="Enter royalties percentage"
                      className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                    />
                  </div>
                  </div>
                  </>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media & Materials Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
                <CardTitle className="text-white text-2xl">Media & Materials</CardTitle>
                <CardDescription className="text-white/90">Manage your photos, videos, and documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter project description"
                    rows={6}
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white resize-none"
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="factSheet" className="text-sm font-semibold text-gray-700">Fact Sheet</Label>
                  <Textarea
                    id="factSheet"
                    value={formData.factSheet}
                    onChange={(e) => handleInputChange('factSheet', e.target.value)}
                    placeholder="Enter fact sheet content"
                    rows={6}
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white resize-none"
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="technicalSheet" className="text-sm font-semibold text-gray-700">Technical Sheet</Label>
                  <Textarea
                    id="technicalSheet"
                    value={formData.technicalSheet}
                    onChange={(e) => handleInputChange('technicalSheet', e.target.value)}
                    placeholder="Enter technical sheet content"
                    rows={6}
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Photo and video uploads will be available in a future update. 
                    For now, you can manage text content here.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/${user.id}`)}
                    className="rounded-full px-6 border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Privacy Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
                <CardTitle className="text-white text-2xl">
                  {isOAuthUser ? 'Create Password' : 'Change Password'}
                </CardTitle>
                <CardDescription className="text-white/90">
                  {isOAuthUser 
                    ? 'Create a password to enable email/password login' 
                    : 'Update your password to keep your account secure'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {!isOAuthUser && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                        setPasswordError('');
                      }}
                    placeholder="Enter current password"
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                  />
                </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordError('');
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setPasswordError('');
                    }}
                    placeholder="Confirm new password"
                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all bg-white"
                  />
                </div>
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      changingPassword || 
                      !passwordData.newPassword || 
                      !passwordData.confirmPassword ||
                      (!isOAuthUser && !passwordData.currentPassword)
                    }
                    className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        {isOAuthUser ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                    <Lock className="h-4 w-4 mr-2" />
                        {isOAuthUser ? 'Create Password' : 'Update Password'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
                <CardTitle className="text-white text-2xl">Privacy Settings</CardTitle>
                <CardDescription className="text-white/90">Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    Privacy settings will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

