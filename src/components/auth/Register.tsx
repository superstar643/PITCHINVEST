import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { base64ToFile, uploadFile, uploadMultipleFiles } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Spinner } from '@/components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ReactCountryFlag from 'react-country-flag';
import { getSortedCountries, getCountryByCode, getCountryByPhoneCode } from '@/lib/countries';
import { getCachedGeolocation } from '@/lib/geolocation';
import { SearchableCountrySelect } from '@/components/ui/searchable-country-select';

type Step = 'usertype' | 'company' | 'personal' | 'pitch';

// Use comprehensive countries list
const countries = getSortedCountries();

export default function Register() {
    const OTP_TTL_SECONDS = 180;
    const [searchParams] = useSearchParams();
    const isOAuthUser = searchParams.get('oauth') === 'true';
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState<Step>('usertype');
    const [phoneCountryCode, setPhoneCountryCode] = useState('+1'); // Default to US for personal telephone
    const [companyPhoneCountryCode, setCompanyPhoneCountryCode] = useState('+1'); // Default to US for company telephone
    const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(null); // Store detected ISO country code
    const [companyPhoneGeolocationAttempted, setCompanyPhoneGeolocationAttempted] = useState(false); // Track if we've tried to detect company phone location
    const [telephoneError, setTelephoneError] = useState('');
    const [companyTelephoneError, setCompanyTelephoneError] = useState('');
    const [formData, setFormData] = useState({
        userType: '',
        companyName: '',
        projectName: '',
        projectCategory: '', // NEW - for Inventor, StartUp, Company
        companyNIF: '',
        companyTelephone: '',
        // Block 1: Equity Participation
        capitalPercentage: '',
        capitalTotalValue: '',
        // Block 2: Brand Licensing (Exploitation)
        licenseFee: '',
        licensingRoyaltiesPercentage: '',
        // Block 3: Franchising
        franchiseeInvestment: '',
        monthlyRoyalties: '',
        // Inventor-specific fields
        inventorName: '',
        licenseNumber: '',
        releaseDate: '',
        initialLicenseValue: '',
        exploitationLicenseRoyalty: '',
        patentSale: '',
        investorsCount: '',
        // StartUp specific
        smartMoney: '', // NEW - only for StartUp
        totalSaleOfProject: '', // NEW - for StartUp and Company
        // Investor specific
        investmentPreferences: '', // NEW - for Investor
        coverImage: '',
        coverImagePreview: '',
        photo: '',
        photoPreview: '',
        fullName: '',
        personalEmail: '',
        password: '',
        telephone: '',
        country: '',
        city: '',
        pitchFile: '',
        videos: [] as string[],
        pitchVideo: '', // NEW - for PITCH Video 2minutes
        photos: [] as string[], // NEW - for 9 Photos
        pitchVideos: [] as string[], // NEW - for multiple Video 2minutes uploads
        factSheet: '',
        technicalSheet: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [geolocationLoading, setGeolocationLoading] = useState(false);

    // Always use OTP verification (password is optional)
    
    // Email OTP (required to get an authenticated session for Storage uploads)
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [oauthUserData, setOauthUserData] = useState<{ name?: string; email?: string; photo?: string } | null>(null);

    // Registration steps for loading overlay
    const [registrationSteps, setRegistrationSteps] = useState<
        Array<{ label: string; status: 'pending' | 'loading' | 'completed' }>
    >([
        { label: 'Verifying email code', status: 'pending' },
        { label: 'Uploading files', status: 'pending' },
        { label: 'Creating your account', status: 'pending' },
    ]);

    // Prefill OAuth user info and keep session handy
    useEffect(() => {
        if (!isOAuthUser) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            const user = session?.user;
            if (!user) return;

            const fullName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                (user.user_metadata?.given_name && user.user_metadata?.family_name
                    ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
                    : null) ||
                user.email?.split('@')[0] ||
                'User';

            const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

            setOauthUserData({
                name: fullName || undefined,
                email: user.email || undefined,
                photo: avatarUrl || undefined,
            });

            setFormData((prev) => ({
                ...prev,
                fullName: prev.fullName || fullName || '',
                personalEmail: prev.personalEmail || user.email || '',
            }));
        });
    }, [isOAuthUser]);

    useEffect(() => {
        if (!otpSent || otpSecondsLeft <= 0) return;
        const t = window.setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
        return () => window.clearInterval(t);
    }, [otpSent, otpSecondsLeft]);

    // Auto-send OTP when modal opens
    useEffect(() => {
        if (showOtpModal && !otpSent && !loading) {
            sendOtpCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showOtpModal]);

    // Auto-detect location when entering personal info step
    useEffect(() => {
        if (currentStep === 'personal' && !formData.country && !geolocationLoading) {
            setGeolocationLoading(true);
            getCachedGeolocation()
                .then((geoData) => {
                    if (geoData && geoData.countryCode) {
                        const detectedCountry = getCountryByCode(geoData.countryCode);
                        if (detectedCountry) {
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
                            // Also update company phone if empty
                            if (!formData.companyTelephone) {
                                setCompanyPhoneCountryCode(detectedCountry.phoneCode);
                            }
                            console.log('Auto-detected location:', detectedCountry.name, geoData.city, 'Code:', detectedCountry.code);
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
    }, [currentStep, formData.country, geolocationLoading, formData.companyTelephone]);

    // Auto-detect location for company telephone when entering company step (StartUp/Company)
    useEffect(() => {
        if (
            currentStep === 'company' && 
            (formData.userType === 'StartUp' || formData.userType === 'Company') && 
            !companyPhoneGeolocationAttempted &&
            !formData.companyTelephone // Only auto-detect if user hasn't entered a phone number yet
        ) {
            setCompanyPhoneGeolocationAttempted(true);
            
            // Check if we already have a detected country code (from personal step)
            if (detectedCountryCode) {
                // Use already detected country code
                const detectedCountry = getCountryByCode(detectedCountryCode);
                if (detectedCountry) {
                    setCompanyPhoneCountryCode(detectedCountry.phoneCode);
                    console.log('Using previously detected location for company telephone:', detectedCountry.name, 'Phone:', detectedCountry.phoneCode);
                }
            } else if (!geolocationLoading) {
                // Need to detect location for the first time
                setGeolocationLoading(true);
                getCachedGeolocation()
                    .then((geoData) => {
                        if (geoData && geoData.countryCode) {
                            const detectedCountry = getCountryByCode(geoData.countryCode);
                            if (detectedCountry) {
                                // Store the detected country code for proper flag display (important for +1 US/Canada)
                                setDetectedCountryCode(detectedCountry.code);
                                // Auto-select company phone country code
                                setCompanyPhoneCountryCode(detectedCountry.phoneCode);
                                console.log('Auto-detected company telephone location:', detectedCountry.name, 'Code:', detectedCountry.code, 'Phone:', detectedCountry.phoneCode);
                            }
                        }
                    })
                    .catch((error) => {
                        console.warn('Geolocation detection for company telephone failed:', error);
                    })
                    .finally(() => {
                        setGeolocationLoading(false);
                    });
            }
        }
    }, [currentStep, formData.userType, formData.companyTelephone, companyPhoneGeolocationAttempted, detectedCountryCode, geolocationLoading]);

    const [fileObjects, setFileObjects] = useState<{
        coverImage?: File;
        photo?: File;
        pitchVideo?: File;
        photos?: File[];
        pitchVideos?: File[];
    }>({});

    const userTypes = ['Inventor', 'StartUp', 'Company', 'Investor'];

    const steps: { id: Step; title: string; description: string }[] = useMemo(() => {
        const all = [
            { id: 'usertype' as Step, title: 'User Role', description: 'Select your role' },
            { 
                id: 'company' as Step, 
                title: formData.userType === 'Inventor' ? 'Inventor Information' 
                    : formData.userType === 'StartUp' ? 'Startup Information'
                    : formData.userType === 'Company' ? 'Company Information'
                    : formData.userType === 'Investor' ? 'Investor Information'
                    : 'Business Info', 
                description: formData.userType === 'Inventor' ? 'Tell us about your invention'
                    : formData.userType === 'StartUp' ? 'Tell us about your startup'
                    : formData.userType === 'Company' ? 'Tell us about your company'
                    : formData.userType === 'Investor' ? 'Tell us about your investment interests'
                    : 'Tell us about your business'
            },
            { id: 'personal' as Step, title: 'Personal Info', description: 'Tell us about yourself' },
            { id: 'pitch' as Step, title: 'Pitch Info', description: formData.userType === 'Investor' ? 'Complete your profile' : 'Upload your pitch materials' },
        ];

        return isOAuthUser ? all.filter((step) => step.id !== 'personal') : all;
    }, [formData.userType, isOAuthUser]);

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    // Phone number validation function
    const validatePhoneNumber = (phone: string, countryCode: string): string => {
        if (!phone.trim()) {
            return 'Phone number is required';
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
            '+39': 10,
            '+44': 10,
            '+49': 11,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
        
        // Real-time phone validation
        if (name === 'telephone') {
            const phoneError = validatePhoneNumber(value, phoneCountryCode);
            setTelephoneError(phoneError);
        } else if (name === 'companyTelephone') {
            const phoneError = validatePhoneNumber(value, companyPhoneCountryCode);
            setCompanyTelephoneError(phoneError);
        }
    };

    // Helper function to validate at least one sale option is filled
    const hasAtLeastOneSaleOption = (): boolean => {
        if (formData.userType === 'Inventor') {
            // Inventor: Must have either Patent Exploitation Fee OR Full Patent Assignment (100%)
            const hasInitialLicenseValue = formData.initialLicenseValue.trim();
            const hasPatentSale = formData.patentSale.trim();
            return !!(hasInitialLicenseValue || hasPatentSale);
        } else if (formData.userType === 'StartUp' || formData.userType === 'Company') {
            // StartUp/Company: Must have at least one complete commercial proposal block
            // Patent Licensing removed - no longer required
            const hasEquityParticipation = formData.capitalPercentage.trim() && formData.capitalTotalValue.trim();
            const hasBrandLicensing = formData.licenseFee.trim() && formData.licensingRoyaltiesPercentage.trim();
            const hasFranchising = formData.franchiseeInvestment.trim() && formData.monthlyRoyalties.trim();
            const hasTotalSale = formData.totalSaleOfProject.trim();
            return !!(hasEquityParticipation || hasBrandLicensing || hasFranchising || hasTotalSale);
        }
        return true; // Investor doesn't need sale options
    };

    const validateStep = (): boolean => {
        setError('');

        switch (currentStep) {
            case 'usertype':
                if (!formData.userType) {
                    setError('Please select your role');
                    return false;
                }
                return true;

            case 'company':
                // Common mandatory fields for all types
                if (formData.userType === 'Inventor' || formData.userType === 'StartUp' || formData.userType === 'Company') {
                    if (!formData.projectName.trim()) {
                        setError('Please enter your project name');
                        return false;
                    }
                    if (!formData.projectCategory.trim()) {
                        setError('Please enter project category');
                        return false;
                    }
                }

                // Company Name is mandatory for StartUp and Company (if applicable per requirements)
                if ((formData.userType === 'StartUp' || formData.userType === 'Company') && !formData.companyName.trim()) {
                    setError('Please enter your company name');
                    return false;
                }

                // Investor validation
                if (formData.userType === 'Investor') {
                    if (!formData.fullName.trim()) {
                        setError('Please enter your full name');
                        return false;
                    }
                    if (!formData.projectCategory.trim()) {
                        setError('Please enter project category interest');
                        return false;
                    }
                    return true;
                }

                // Validate phone number if company telephone is provided (optional field)
                if ((formData.userType === 'StartUp' || formData.userType === 'Company') && formData.companyTelephone.trim()) {
                    const companyPhoneError = validatePhoneNumber(formData.companyTelephone, companyPhoneCountryCode);
                    if (companyPhoneError) {
                        setCompanyTelephoneError(companyPhoneError);
                        setError(companyPhoneError);
                        return false;
                    }
                }

                // Validate at least one sale option is filled (for Inventor, StartUp, Company)
                if (!hasAtLeastOneSaleOption()) {
                    if (formData.userType === 'Inventor') {
                        setError('Please fill at least one sale option: Patent Exploitation Fee OR Full Patent Assignment (100%)');
                    } else {
                        setError('Please fill at least one complete commercial proposal option (Investment Offer, Brand Exploitation Rights, Franchise, or Total Sale)');
                    }
                    return false;
                }

                return true;

            case 'personal':
            if (isOAuthUser) return true;
                // Cover Image and Photo are now optional
                // Only validate personal contact data
                
                if (!formData.fullName.trim()) {
                    setError('Please enter your full name');
                    return false;
                }
                if (!formData.personalEmail) {
                    setError('Please enter your email');
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
                    setError('Please enter a valid email');
                    return false;
                }
                // Password validation (optional - if provided, must be valid)
                if (formData.password && formData.password.length > 0) {
                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters long');
                        return false;
                    }
                }
                if (!formData.telephone.trim()) {
                    setError('Please enter your telephone');
                    return false;
                }
                const phoneError = validatePhoneNumber(formData.telephone, phoneCountryCode);
                if (phoneError) {
                    setTelephoneError(phoneError);
                    setError(phoneError);
                    return false;
                }
                if (!formData.country.trim()) {
                    setError('Please select your country');
                    return false;
                }
                if (!formData.city.trim()) {
                    setError('Please enter your city');
                    return false;
                }
                return true;

            case 'pitch':
                // All pitch materials are now optional for all user types
                // No validation needed - users can proceed even if they don't upload anything
                return true;

            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        if (currentStep === 'usertype') {
            setCurrentStep('company');
        } else if (currentStep === 'company') {
            setCurrentStep(isOAuthUser ? 'pitch' : 'personal');
        } else if (currentStep === 'personal') {
            setCurrentStep('pitch');
        } else if (currentStep === 'pitch') {
            if (isOAuthUser) {
                await handleOAuthRegistration();
            } else {
                // Always open OTP modal for verification - OTP will be sent automatically via useEffect
                setShowOtpModal(true);
            }
        }
    };

    // Send OTP code function
    async function sendOtpCode() {
        setError('');
            setLoading(true);
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: formData.personalEmail,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (otpError) throw new Error(`Failed to send verification code: ${otpError.message}`);

            setOtpSent(true);
            setOtpSecondsLeft(OTP_TTL_SECONDS);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to send verification code.';
            setError(msg);
            toast({
                title: 'Error',
                description: msg,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    // Verify OTP and proceed with registration
    async function verifyOtpAndRegister() {
        if (otpSecondsLeft <= 0) {
            setError('Verification code expired. Please resend a new code.');
            return;
        }

        const code = otpCode.trim();
        if (!/^\d{6}$/.test(code)) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        // Close modal and start registration
        setShowOtpModal(false);
        await handleRegistration(code);
    }

    // Common registration data handling (file uploads and database inserts)
    async function handleRegistrationData(userId: string) {
        try {
            // STEP 2: Upload files
            const fileUrls: {
                coverImage?: string;
                photo?: string;
                pitchVideo?: string;
                photos?: string[];
                pitchVideos?: string[];
            } = {};

            // Cover image (optional)
            if (fileObjects.coverImage) {
                const res = await uploadFile('cover-images', fileObjects.coverImage, userId);
                if (res.url) fileUrls.coverImage = res.url;
                else if (res.error) console.warn('Cover image upload error:', res.error);
            } else if (formData.coverImagePreview) {
                const file = await base64ToFile(formData.coverImagePreview, formData.coverImage || 'cover.jpg');
                const res = await uploadFile('cover-images', file, userId);
                if (res.url) fileUrls.coverImage = res.url;
                else if (res.error) console.warn('Cover image upload error:', res.error);
            }

            // User photo (optional)
            if (fileObjects.photo) {
                const res = await uploadFile('user-photos', fileObjects.photo, userId);
                if (res.url) fileUrls.photo = res.url;
                else if (res.error) console.warn('User photo upload error:', res.error);
            } else if (formData.photoPreview) {
                const file = await base64ToFile(formData.photoPreview, formData.photo || 'photo.jpg');
                const res = await uploadFile('user-photos', file, userId);
                if (res.url) fileUrls.photo = res.url;
                else if (res.error) console.warn('User photo upload error:', res.error);
            }

            // Pitch video (optional for all types)
            if (fileObjects.pitchVideo) {
                const res = await uploadFile('pitch-videos', fileObjects.pitchVideo, userId, 'pitch');
                if (res.url) fileUrls.pitchVideo = res.url;
                else if (res.error) console.warn('Pitch video upload error:', res.error);
            }

            // Photos + Pitch Videos (optional for all types)
            if (fileObjects.photos?.length) {
                const res = await uploadMultipleFiles('pitch-photos', fileObjects.photos, userId, 'photos');
                fileUrls.photos = res.urls;
                if (res.errors.length) console.warn('Some photo uploads failed:', res.errors);
            }

            if (fileObjects.pitchVideos?.length) {
                const valid = fileObjects.pitchVideos.filter(Boolean) as File[];
                if (valid.length) {
                    const res = await uploadMultipleFiles('pitch-videos', valid, userId, 'videos');
                    fileUrls.pitchVideos = res.urls;
                    if (res.errors.length) console.warn('Some pitch video uploads failed:', res.errors);
                }
            }

            // Update step 2 as completed, start step 3
            setRegistrationSteps((prev) => {
                const updated = [...prev];
                const uploadIndex = updated.findIndex(s => s.label.includes('Uploading'));
                const saveIndex = updated.findIndex(s => s.label.includes('Saving') || s.label.includes('Creating'));
                if (uploadIndex >= 0) updated[uploadIndex] = { ...updated[uploadIndex], status: 'completed' };
                if (saveIndex >= 0) updated[saveIndex] = { ...updated[saveIndex], status: 'loading' };
                return updated;
            });

            // STEP 3: Insert or update users table (use upsert to handle retries)
            // For OAuth users, use OAuth data as fallback if formData is empty
            const finalFullName = formData.fullName || oauthUserData?.name || '';
            const finalEmail = formData.personalEmail || oauthUserData?.email || '';
            
            const { error: userError } = await supabase.from('users').upsert({
                id: userId,
                user_type: formData.userType,
                full_name: finalFullName,
                personal_email: finalEmail,
                    telephone: formData.telephone || null, // OAuth users skip personal step, so these will be null
                    country: formData.country || null,
                    city: formData.city || null,
                cover_image_url: fileUrls.coverImage || null,
                photo_url: fileUrls.photo || oauthUserData?.photo || null,
            }, {
                onConflict: 'id' // Update if user already exists
            });
            if (userError) throw new Error(`Failed to create user record: ${userError.message}`);

            // STEP 4: Insert into profiles table (role-specific fields)
            const profileData: Record<string, unknown> = {
                user_id: userId,
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
                exploitation_license_royalty: formData.userType === 'Inventor' ? (formData.exploitationLicenseRoyalty || null) : null, // Only for Inventor
                patent_sale: formData.patentSale || null,
                investors_count: formData.investorsCount || null,
            };

            const { error: profileError } = await supabase.from('profiles').upsert(profileData, {
                onConflict: 'user_id' // Update if profile already exists
            });
            if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);

            // STEP 5: Insert commercial proposals (optional; non-investor)
            const hasProposalData =
                !!formData.capitalPercentage ||
                !!formData.capitalTotalValue ||
                !!formData.licenseFee ||
                !!formData.licensingRoyaltiesPercentage ||
                !!formData.franchiseeInvestment ||
                !!formData.monthlyRoyalties ||
                (formData.userType === 'Inventor' && !!formData.initialLicenseValue);

            if (formData.userType !== 'Investor' && hasProposalData) {
                const proposalData: Record<string, unknown> = {
                    user_id: userId,
                    equity_capital_percentage: formData.capitalPercentage || null,
                    equity_total_value: formData.capitalTotalValue || null,
                    license_fee: formData.licenseFee || null,
                    licensing_royalties_percentage: formData.licensingRoyaltiesPercentage || null,
                    franchisee_investment: formData.franchiseeInvestment || null,
                    monthly_royalties: formData.monthlyRoyalties || null,
                    patent_upfront_fee: formData.userType === 'Inventor' ? (formData.initialLicenseValue || null) : null,
                    patent_royalties: formData.userType === 'Inventor' ? (formData.exploitationLicenseRoyalty || null) : null, // Only for Inventor
                };

                const { error: proposalError } = await supabase.from('commercial_proposals').upsert(proposalData, {
                    onConflict: 'user_id' // Update if proposal already exists
                });
                if (proposalError) console.warn('Commercial proposal upsert error:', proposalError);
            }

            // STEP 6: Insert pitch materials
            const pitchData: Record<string, unknown> = {
                user_id: userId,
                pitch_video_url: fileUrls.pitchVideo || null,
                photos_urls: formData.userType === 'Investor' ? [] : (fileUrls.photos || []),
                pitch_videos_urls: formData.userType === 'Investor' ? [] : (fileUrls.pitchVideos || []),
                description: formData.description || null,
                fact_sheet: formData.userType === 'Investor' ? null : (formData.factSheet || null),
                technical_sheet: formData.userType === 'Investor' ? null : (formData.technicalSheet || null),
            };

            const { error: pitchError } = await supabase.from('pitch_materials').upsert(pitchData, {
                onConflict: 'user_id' // Update if pitch materials already exist
            });
            if (pitchError) throw new Error(`Failed to create pitch materials: ${pitchError.message}`);

            // Mark all steps as completed
            setRegistrationSteps((prev) => prev.map(step => ({ ...step, status: 'completed' })));

            // Small delay to show completion
            await new Promise(resolve => setTimeout(resolve, 800));

            // Hide loading overlay first
            setLoading(false);
            setOtpSent(false);
            setOtpCode('');
            setOtpSecondsLeft(0);

            console.log('✅ Registration completed successfully!');
            setError(''); // Clear any errors

            // Wait a bit for overlay to disappear, then show toast
            await new Promise(resolve => setTimeout(resolve, 300));

            toast({
                title: 'Registration successful!',
                description: 'Your account has been created successfully.',
                variant: 'default',
            });

            // Redirect to login after 5 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 5000);

        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Registration failed. Please try again.';
            setError(msg);
            toast({
                title: 'Registration error',
                description: msg,
                variant: 'destructive',
            });
            setLoading(false);
            setRegistrationSteps([]);
            throw e; // Re-throw to be caught by caller
        }
    }

    async function handleRegistration(verifiedCode: string) {
            setLoading(true);
        setError('');

        try {

            // Update step 1: Verifying email
            setRegistrationSteps([
                { label: 'Verifying email code', status: 'loading' },
                { label: 'Uploading files', status: 'pending' },
                { label: 'Creating your account', status: 'pending' },
            ]);

            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                email: formData.personalEmail,
                token: verifiedCode,
                type: 'email',
            });

            if (verifyError) throw new Error(`Invalid verification code: ${verifyError.message}`);
            if (!verifyData.user) throw new Error('Verification succeeded but no user data returned.');

            // Store metadata in auth (optional, but useful)
            // Supabase "Display name" in the dashboard is commonly sourced from user metadata (e.g. `name`).
            // Keep `full_name` (used throughout the app) and also set `name`/`display_name` for consistency.
            // If password was provided, update it here
            const updateData: { data: Record<string, unknown>; password?: string } = {
                data: {
                    full_name: formData.fullName,
                    name: formData.fullName,
                    display_name: formData.fullName,
                    user_type: formData.userType,
                },
            };
            
            // If password was provided, add it to the update
            if (formData.password && formData.password.length >= 6) {
                updateData.password = formData.password;
            }
            
            await supabase.auth.updateUser(updateData);

            const userId = verifyData.user.id;

            // Mark step 1 as completed, start step 2
            setRegistrationSteps([
                { label: 'Verifying email code', status: 'completed' },
                { label: 'Uploading files', status: 'loading' },
                { label: 'Saving your profile', status: 'pending' },
            ]);

            // Proceed with file uploads and database inserts (shared logic)
            await handleRegistrationData(userId);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Registration failed. Please try again.';
            console.error('❌ Registration error:', e);
            setError(msg);
            toast({
                title: 'Registration error',
                description: msg,
                variant: 'destructive',
            });
            setLoading(false);
            setRegistrationSteps([]);
        }
    }

    // OAuth-specific registration flow (skip OTP/personal step)
    async function handleOAuthRegistration() {
        setLoading(true);
        setError('');

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) {
                throw new Error('No active session. Please sign in again.');
            }

            const userId = session.user.id;
            const fallbackName =
                formData.fullName ||
                oauthUserData?.name ||
                session.user.email?.split('@')[0] ||
                'User';

            // Update registration steps for OAuth (no OTP)
            setRegistrationSteps([
                { label: 'Uploading files', status: 'loading' },
                { label: 'Saving your profile', status: 'pending' },
            ]);

            // Update auth metadata
            await supabase.auth.updateUser({
                data: {
                    full_name: fallbackName,
                    name: fallbackName,
                    display_name: fallbackName,
                    user_type: formData.userType,
                },
            });

            setRegistrationSteps([
                { label: 'Uploading files', status: 'completed' },
                { label: 'Saving your profile', status: 'loading' },
            ]);

            // Proceed with uploads and DB inserts
            await handleRegistrationData(userId);

            setRegistrationSteps([
                { label: 'Uploading files', status: 'completed' },
                { label: 'Saving your profile', status: 'completed' },
            ]);

            toast({
                title: 'Registration complete!',
                description: 'Your account has been created successfully.',
            });

            setTimeout(() => {
                window.location.replace('/');
            }, 1000);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Registration failed. Please try again.';
            console.error('❌ OAuth Registration error:', e);
            setError(msg);
            toast({
                title: 'Registration error',
                description: msg,
                variant: 'destructive',
            });
            setLoading(false);
            setRegistrationSteps([]);
        }
    }

    const handleBack = () => {
        // Clear any errors when going back
        setError('');
        setTelephoneError('');
        setCompanyTelephoneError('');
        setOtpSent(false);
        setOtpCode('');
        setOtpSecondsLeft(0);
        setShowOtpModal(false);
        
        if (currentStep === 'company') {
            setCurrentStep('usertype');
        } else if (currentStep === 'personal') {
            setCurrentStep('company');
        } else if (currentStep === 'pitch') {
            setCurrentStep(isOAuthUser ? 'company' : 'personal');
        }
    };

    return (
        <>
            <LoadingOverlay
                isOpen={loading}
                message="Creating your account"
                steps={registrationSteps}
            />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <Card className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-all ${index <= currentStepIndex
                                            ? 'text-white'
                                            : 'bg-gray-200 text-gray-400'
                                        }`}
                                    style={{ backgroundColor: index <= currentStepIndex ? '#0a3d5c' : '' }}
                                >
                                    {index + 1}
                                </div>
                                <span className="text-xs text-gray-600 text-center min-h-[2.5rem] flex items-start justify-center leading-tight px-1">{step.title}</span>
                            </div>
                        ))}
                    </div>
                    {/* Progress Line */}
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300"
                            style={{ width: `${progress}%`, backgroundColor: '#0a3d5c' }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[300px] flex flex-col justify-between">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {steps[currentStepIndex].title}
                        </h1>
                        <p className="text-gray-600">{steps[currentStepIndex].description}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Step 1: User Type Selection */}
                    {currentStep === 'usertype' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {userTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, userType: type }));
                                            setError('');
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.userType === type
                                                ? 'border-gray-800 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-blue-200'
                                            }`}
                                        style={formData.userType === type ? { borderColor: '#0a3d5c', backgroundColor: '#f0f8ff' } : {}}
                                    >
                                        <span className="text-left font-semibold text-gray-800">{type}</span>
                                        {formData.userType === type && (
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0a3d5c' }}>
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Company Info / Inventor Information */}
                    {currentStep === 'company' && (
                        <div className="space-y-4">
                            {formData.userType === 'Inventor' ? (
                                <>
                                    {/* Inventor Name */}
                                    <div>
                                        <label htmlFor="inventorName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Inventor Name
                                        </label>
                                        <input
                                            id="inventorName"
                                            name="inventorName"
                                            type="text"
                                            value={formData.inventorName}
                                            onChange={handleChange}
                                            placeholder="Ex: John"
                                            autoFocus
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Name */}
                                    <div>
                                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name
                                        </label>
                                        <input
                                            id="projectName"
                                            name="projectName"
                                            type="text"
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            placeholder="Ex: Donate"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Category */}
                                    <div>
                                        <label htmlFor="projectCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Category
                                        </label>
                                        <input
                                            id="projectCategory"
                                            name="projectCategory"
                                            type="text"
                                            value={formData.projectCategory}
                                            onChange={handleChange}
                                            placeholder="e.g., Medical Technology, Automotive, Food & Beverage"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* License Number */}
                                    <div>
                                        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            License Number
                                        </label>
                                        <input
                                            id="licenseNumber"
                                            name="licenseNumber"
                                            type="text"
                                            value={formData.licenseNumber}
                                            onChange={handleChange}
                                            placeholder="Ex: 515 919 325"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Release Date */}
                                    <div>
                                        <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Release date
                                        </label>
                                        <input
                                            id="releaseDate"
                                            name="releaseDate"
                                            type="text"
                                            value={formData.releaseDate}
                                            onChange={handleChange}
                                            placeholder="Ex: 10/12/2025"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Patent Exploitation Fee */}
                                    <div>
                                        <label htmlFor="initialLicenseValue" className="block text-sm font-medium text-gray-700 mb-1">
                                            Patent Exploitation Fee
                                        </label>
                                        <input
                                            id="initialLicenseValue"
                                            name="initialLicenseValue"
                                            type="text"
                                            value={formData.initialLicenseValue}
                                            onChange={handleChange}
                                            placeholder="Ex: $10.000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Patent Exploitation Royalties */}
                                    <div>
                                        <label htmlFor="exploitationLicenseRoyalty" className="block text-sm font-medium text-gray-700 mb-1">
                                            Patent Exploitation Royalties
                                        </label>
                                        <input
                                            id="exploitationLicenseRoyalty"
                                            name="exploitationLicenseRoyalty"
                                            type="text"
                                            value={formData.exploitationLicenseRoyalty}
                                            onChange={handleChange}
                                            placeholder="Ex: 6%"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Full Patent Assignment (100%) */}
                                    <div>
                                        <label htmlFor="patentSale" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Patent Assignment (100%)
                                        </label>
                                        <input
                                            id="patentSale"
                                            name="patentSale"
                                            type="text"
                                            value={formData.patentSale}
                                            onChange={handleChange}
                                            placeholder="Ex: $ 350.000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* 1-200 Investors */}
                                    <div>
                                        <label htmlFor="investorsCount" className="block text-sm font-medium text-gray-700 mb-1">
                                            1-200 Investors
                                        </label>
                                        <input
                                            id="investorsCount"
                                            name="investorsCount"
                                            type="text"
                                            value={formData.investorsCount}
                                            onChange={handleChange}
                                            placeholder="Example: 3 Investors"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>
                                </>
                            ) : formData.userType === 'StartUp' ? (
                                <>
                                    {/* Smart Money - at the top for StartUp */}
                                    <div>
                                        <label htmlFor="smartMoney" className="block text-sm font-medium text-gray-700 mb-1">
                                            Smart Money
                                        </label>
                                        <input
                                            id="smartMoney"
                                            name="smartMoney"
                                            type="text"
                                            value={formData.smartMoney}
                                            onChange={handleChange}
                                            placeholder="Enter Smart Money details"
                                            autoFocus
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Company Name */}
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name
                                        </label>
                                        <input
                                            id="companyName"
                                            name="companyName"
                                            type="text"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Your Company"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Name */}
                                    <div>
                                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name
                                        </label>
                                        <input
                                            id="projectName"
                                            name="projectName"
                                            type="text"
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            placeholder="Your Project"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Category */}
                                    <div>
                                        <label htmlFor="projectCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Category
                                        </label>
                                        <input
                                            id="projectCategory"
                                            name="projectCategory"
                                            type="text"
                                            value={formData.projectCategory}
                                            onChange={handleChange}
                                            placeholder="e.g., SaaS, E-commerce, FinTech"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Company NIF */}
                                    <div>
                                        <label htmlFor="companyNIF" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company NIF
                                        </label>
                                        <input
                                            id="companyNIF"
                                            name="companyNIF"
                                            type="text"
                                            value={formData.companyNIF}
                                            onChange={handleChange}
                                            placeholder="NIF"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                            <div>
                                <label htmlFor="companyTelephone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Telephone
                                </label>
                                <div className={`flex items-center gap-0 border rounded-lg overflow-hidden focus-within:ring-2 transition ${
                                    companyTelephoneError 
                                        ? 'border-red-500 focus-within:ring-red-500/20 focus-within:border-red-500' 
                                        : 'border-gray-300 focus-within:ring-[#0a3d5c]/20 focus-within:border-[#0a3d5c]'
                                }`}>
                                    {/* Country Code Selector */}
                                    <SearchableCountrySelect
                                        countries={countries}
                                        value={companyPhoneCountryCode}
                                        onValueChange={(value) => {
                                            setCompanyPhoneCountryCode(value);
                                            // Re-validate when country code changes
                                            if (formData.companyTelephone) {
                                                const phoneError = validatePhoneNumber(formData.companyTelephone, value);
                                                setCompanyTelephoneError(phoneError);
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
                                        id="companyTelephone"
                                        name="companyTelephone"
                                        type="tel"
                                        value={formData.companyTelephone}
                                        onChange={handleChange}
                                        placeholder="(555) 000-0000"
                                        className="flex-1 px-4 py-2 border-0 outline-none transition"
                                        onFocus={(e) => {
                                            e.currentTarget.parentElement?.style.setProperty('box-shadow', '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c');
                                            e.currentTarget.parentElement?.style.setProperty('border-color', '#0a3d5c');
                                        }}
                                        onBlur={(e) => {
                                            const phoneError = validatePhoneNumber(formData.companyTelephone, companyPhoneCountryCode);
                                            setCompanyTelephoneError(phoneError);
                                            if (!phoneError) {
                                                e.currentTarget.parentElement?.style.setProperty('box-shadow', 'none');
                                                e.currentTarget.parentElement?.style.setProperty('border-color', '#d1d5db');
                                            }
                                        }}
                                    />
                                </div>
                                {companyTelephoneError && (
                                    <p className="mt-1 text-sm text-red-600">{companyTelephoneError}</p>
                                )}
                            </div>

                            {/* Commercial Proposal Options - All 4 blocks for StartUp */}
                            <div className="space-y-6 mt-6">
                                {/* Block 1: Investment Offer (%) - Highlighted for StartUp */}
                                <div className={`border rounded-lg p-5 ${formData.userType === 'StartUp' ? 'border-[#0a3d5c] bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                                Investment Offer (%)
                                        {formData.userType === 'StartUp' && <span className="ml-2 text-xs text-[#0a3d5c]">(Primary)</span>}
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="capitalPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                Equity
                                            </label>
                                            <input
                                                id="capitalPercentage"
                                                name="capitalPercentage"
                                                type="text"
                                                value={formData.capitalPercentage}
                                                onChange={handleChange}
                                                placeholder="e.g., 20%"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                    e.currentTarget.style.borderColor = '#0a3d5c';
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="capitalTotalValue" className="block text-sm font-medium text-gray-700 mb-1">
                                                Investment Amount
                                            </label>
                                            <input
                                                id="capitalTotalValue"
                                                name="capitalTotalValue"
                                                type="text"
                                                value={formData.capitalTotalValue}
                                                onChange={handleChange}
                                                placeholder="e.g., $250,000"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                    e.currentTarget.style.borderColor = '#0a3d5c';
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Block 2: Brand Exploitation Rights */}
                                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">Brand Exploitation Rights</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="licenseFee" className="block text-sm font-medium text-gray-700 mb-1">
                                                Initial Licensing Fee
                                            </label>
                                            <input
                                                id="licenseFee"
                                                name="licenseFee"
                                                type="text"
                                                value={formData.licenseFee}
                                                onChange={handleChange}
                                                placeholder="e.g., $15,000"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                    e.currentTarget.style.borderColor = '#0a3d5c';
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="licensingRoyaltiesPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                Royalties (%)
                                            </label>
                                            <input
                                                id="licensingRoyaltiesPercentage"
                                                name="licensingRoyaltiesPercentage"
                                                type="text"
                                                value={formData.licensingRoyaltiesPercentage}
                                                onChange={handleChange}
                                                placeholder="e.g., 6%"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                    e.currentTarget.style.borderColor = '#0a3d5c';
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Block 3: Franchise */}
                                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">Franchise</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="franchiseeInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                                                Franchise Fee
                                            </label>
                                            <input
                                                id="franchiseeInvestment"
                                                name="franchiseeInvestment"
                                                type="text"
                                                value={formData.franchiseeInvestment}
                                                onChange={handleChange}
                                                placeholder="e.g., $15,000"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                    e.currentTarget.style.borderColor = '#0a3d5c';
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="monthlyRoyalties" className="block text-sm font-medium text-gray-700 mb-1">
                                                Royalties (%)
                                            </label>
                                            <input
                                                id="monthlyRoyalties"
                                                name="monthlyRoyalties"
                                                type="text"
                                                value={formData.monthlyRoyalties}
                                                onChange={handleChange}
                                                placeholder="e.g., 6%"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                    e.currentTarget.style.borderColor = '#0a3d5c';
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Total Sale of Project - for StartUp */}
                            <div className="mt-6">
                                <label htmlFor="totalSaleOfProject" className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Sale of Project
                                </label>
                                <input
                                    id="totalSaleOfProject"
                                    name="totalSaleOfProject"
                                    type="text"
                                    value={formData.totalSaleOfProject}
                                    onChange={handleChange}
                                    placeholder="e.g., $2,000,000 (for selling entire startup)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                />
                            </div>
                                </>
                            ) : formData.userType === 'Company' ? (
                                <>
                                    {/* Company Name */}
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name
                                        </label>
                                        <input
                                            id="companyName"
                                            name="companyName"
                                            type="text"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Your Company"
                                            autoFocus
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Name */}
                                    <div>
                                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name
                                        </label>
                                        <input
                                            id="projectName"
                                            name="projectName"
                                            type="text"
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            placeholder="Your Project"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Category */}
                                    <div>
                                        <label htmlFor="projectCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Category
                                        </label>
                                        <input
                                            id="projectCategory"
                                            name="projectCategory"
                                            type="text"
                                            value={formData.projectCategory}
                                            onChange={handleChange}
                                            placeholder="e.g., Restaurant, Retail, Manufacturing"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Company NIF */}
                                    <div>
                                        <label htmlFor="companyNIF" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company NIF
                                        </label>
                                        <input
                                            id="companyNIF"
                                            name="companyNIF"
                                            type="text"
                                            value={formData.companyNIF}
                                            onChange={handleChange}
                                            placeholder="NIF"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Company Telephone */}
                                    <div>
                                        <label htmlFor="companyTelephone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Telephone
                                        </label>
                                        <div className={`flex items-center gap-0 border rounded-lg overflow-hidden focus-within:ring-2 transition ${
                                            companyTelephoneError 
                                                ? 'border-red-500 focus-within:ring-red-500/20 focus-within:border-red-500' 
                                                : 'border-gray-300 focus-within:ring-[#0a3d5c]/20 focus-within:border-[#0a3d5c]'
                                        }`}>
                                            <SearchableCountrySelect
                                                countries={countries}
                                                value={companyPhoneCountryCode}
                                                onValueChange={(value) => {
                                                    setCompanyPhoneCountryCode(value);
                                                    if (formData.companyTelephone) {
                                                        const phoneError = validatePhoneNumber(formData.companyTelephone, value);
                                                        setCompanyTelephoneError(phoneError);
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
                                            <input
                                                id="companyTelephone"
                                                name="companyTelephone"
                                                type="tel"
                                                value={formData.companyTelephone}
                                                onChange={handleChange}
                                                placeholder="(555) 000-0000"
                                                className="flex-1 px-4 py-2 border-0 outline-none transition"
                                                onFocus={(e) => {
                                                    e.currentTarget.parentElement?.style.setProperty('box-shadow', '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c');
                                                    e.currentTarget.parentElement?.style.setProperty('border-color', '#0a3d5c');
                                                }}
                                                onBlur={(e) => {
                                                    const phoneError = validatePhoneNumber(formData.companyTelephone, companyPhoneCountryCode);
                                                    setCompanyTelephoneError(phoneError);
                                                    if (!phoneError) {
                                                        e.currentTarget.parentElement?.style.setProperty('box-shadow', 'none');
                                                        e.currentTarget.parentElement?.style.setProperty('border-color', '#d1d5db');
                                                    }
                                                }}
                                            />
                                        </div>
                                        {companyTelephoneError && (
                                            <p className="mt-1 text-sm text-red-600">{companyTelephoneError}</p>
                                        )}
                                    </div>

                                    {/* Commercial Proposal Options - All 4 blocks for Company */}
                                    <div className="space-y-6 mt-6">
                                        {/* Block 1: Investment Offer (%) */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Investment Offer (%)</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="capitalPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Equity
                                                    </label>
                                                    <input
                                                        id="capitalPercentage"
                                                        name="capitalPercentage"
                                                        type="text"
                                                        value={formData.capitalPercentage}
                                                        onChange={handleChange}
                                                        placeholder="e.g., 20%"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="capitalTotalValue" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Investment Amount
                                                    </label>
                                                    <input
                                                        id="capitalTotalValue"
                                                        name="capitalTotalValue"
                                                        type="text"
                                                        value={formData.capitalTotalValue}
                                                        onChange={handleChange}
                                                        placeholder="e.g., $250,000"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Block 2: Brand Exploitation Rights */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Brand Exploitation Rights</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="licenseFee" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Initial Licensing Fee
                                                    </label>
                                                    <input
                                                        id="licenseFee"
                                                        name="licenseFee"
                                                        type="text"
                                                        value={formData.licenseFee}
                                                        onChange={handleChange}
                                                        placeholder="e.g., $15,000"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="licensingRoyaltiesPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Royalties (%)
                                                    </label>
                                                    <input
                                                        id="licensingRoyaltiesPercentage"
                                                        name="licensingRoyaltiesPercentage"
                                                        type="text"
                                                        value={formData.licensingRoyaltiesPercentage}
                                                        onChange={handleChange}
                                                        placeholder="e.g., 6%"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Block 3: Franchise - Highlighted for Company */}
                                        <div className={`border rounded-lg p-5 ${formData.userType === 'Company' ? 'border-[#0a3d5c] bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">
                                                Franchise
                                                {formData.userType === 'Company' && <span className="ml-2 text-xs text-[#0a3d5c]">(Primary)</span>}
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="franchiseeInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Franchise Fee
                                                    </label>
                                                    <input
                                                        id="franchiseeInvestment"
                                                        name="franchiseeInvestment"
                                                        type="text"
                                                        value={formData.franchiseeInvestment}
                                                        onChange={handleChange}
                                                        placeholder="e.g., $15,000"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="monthlyRoyalties" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Royalties (%)
                                                    </label>
                                                    <input
                                                        id="monthlyRoyalties"
                                                        name="monthlyRoyalties"
                                                        type="text"
                                                        value={formData.monthlyRoyalties}
                                                        onChange={handleChange}
                                                        placeholder="e.g., 6%"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Sale of Project - for Company */}
                                    <div className="mt-6">
                                        <label htmlFor="totalSaleOfProject" className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Sale of Project
                                        </label>
                                        <input
                                            id="totalSaleOfProject"
                                            name="totalSaleOfProject"
                                            type="text"
                                            value={formData.totalSaleOfProject}
                                            onChange={handleChange}
                                            placeholder="e.g., $5,000,000 (for selling entire company)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>
                                </>
                            ) : formData.userType === 'Investor' ? (
                                <>
                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            autoFocus
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Project Category Interest */}
                                    <div>
                                        <label htmlFor="projectCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Category Interest
                                        </label>
                                        <input
                                            id="projectCategory"
                                            name="projectCategory"
                                            type="text"
                                            value={formData.projectCategory}
                                            onChange={handleChange}
                                            placeholder="e.g., Medical, Automotive, FinTech"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>

                                    {/* Investment Preferences */}
                                    <div>
                                        <label htmlFor="investmentPreferences" className="block text-sm font-medium text-gray-700 mb-1">
                                            Investment Preferences (Optional)
                                        </label>
                                        <textarea
                                            id="investmentPreferences"
                                            name="investmentPreferences"
                                            value={formData.investmentPreferences}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, investmentPreferences: e.target.value }));
                                                setError('');
                                            }}
                                            placeholder="Describe your investment criteria and preferences"
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Step 3: Personal Info */}
                    {currentStep === 'personal' && (
                        <div className="space-y-4 overflow-y-auto px-2">
                            {/* Cover Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image
                                </label>
                                <div className="relative">
                                    <label
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                                        }}
                                        onDragLeave={(e) => {
                                            e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.backgroundColor = '';
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.backgroundColor = '';
                                            if (e.dataTransfer.files?.[0]) {
                                                const file = e.dataTransfer.files[0];
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        coverImage: file.name,
                                                        coverImagePreview: event.target?.result as string,
                                                    }));
                                                    setFileObjects((prev) => ({ ...prev, coverImage: file }));
                                                    setError('');
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        {formData.coverImagePreview ? (
                                            <div className="w-full relative">
                                                <img src={formData.coverImagePreview} alt="Cover preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            coverImage: '',
                                                            coverImagePreview: '',
                                                        }));
                                                        setFileObjects((prev) => {
                                                            const { coverImage, ...rest } = prev;
                                                            return rest;
                                                        });
                                                        // Reset the file input
                                                        const fileInput = document.getElementById('coverImage') as HTMLInputElement;
                                                        if (fileInput) {
                                                            fileInput.value = '';
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                                                    title="Delete cover image"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <p className="text-sm text-green-600 text-center">✓ {formData.coverImage}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center pointer-events-none">
                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-600">Drag and drop cover image here or click</p>
                                            </div>
                                        )}
                                        <input
                                            id="coverImage"
                                            name="coverImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            coverImage: file.name,
                                                            coverImagePreview: event.target?.result as string,
                                                        }));
                                                        setFileObjects((prev) => ({ ...prev, coverImage: file }));
                                                        setError('');
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* User Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Photo
                                </label>
                                <div className="relative">
                                    <label
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                                        }}
                                        onDragLeave={(e) => {
                                            e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.backgroundColor = '';
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.backgroundColor = '';
                                            if (e.dataTransfer.files?.[0]) {
                                                const file = e.dataTransfer.files[0];
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        photo: file.name,
                                                        photoPreview: event.target?.result as string,
                                                    }));
                                                    setFileObjects((prev) => ({ ...prev, photo: file }));
                                                    setError('');
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        {formData.photoPreview ? (
                                            <div className="w-full flex justify-center">
                                                <div className="w-32 h-32 relative">
                                                    <img src={formData.photoPreview} alt="Photo preview" className="w-full h-full object-cover rounded-full" style={{ borderColor: '#0a3d5c', borderWidth: '2px' }} />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                photo: '',
                                                                photoPreview: '',
                                                            }));
                                                            setFileObjects((prev) => {
                                                                const { photo, ...rest } = prev;
                                                                return rest;
                                                            });
                                                            // Reset the file input
                                                            const fileInput = document.getElementById('photo') as HTMLInputElement;
                                                            if (fileInput) {
                                                                fileInput.value = '';
                                                            }
                                                        }}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                                                        title="Delete user photo"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    <p className="text-sm text-green-600 text-center mt-2">✓ {formData.photo}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center pointer-events-none">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <p className="text-sm text-gray-600">Drag and drop user photo here or click</p>
                                            </div>
                                        )}
                                        <input
                                            id="photo"
                                            name="photo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            photo: file.name,
                                                            photoPreview: event.target?.result as string,
                                                        }));
                                                        setFileObjects((prev) => ({ ...prev, photo: file }));
                                                        setError('');
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    autoFocus
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    id="personalEmail"
                                    name="personalEmail"
                                    type="email"
                                    value={formData.personalEmail}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                />
                            </div>

                            {/* Password Field (Optional) */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password (optional)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                />
                                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters if provided. Account verification will be done via email OTP code.</p>
                            </div>

                            <div>
                                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Telephone
                                </label>
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
                                        onChange={handleChange}
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

                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <SearchableCountrySelect
                                    countries={countries}
                                    value={formData.country}
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({ ...prev, country: value }));
                                        setError('');
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
                                    triggerClassName="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition h-auto min-h-[42px]"
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Lisbon"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition mb-1"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Pitch Documents */}
                    {currentStep === 'pitch' && (
                        <div className="space-y-4 overflow-y-auto px-2">
                            {formData.userType === 'Investor' ? (
                                <>
                                    {/* Upload Video 2minutes for Investor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Video 2minutes
                                </label>
                                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                                    <div className="text-center pointer-events-none">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                                <p className="text-sm text-gray-600">{formData.pitchVideo || formData.videos[0] || 'Click to upload video (MP4, MOV, AVI)'}</p>
                                    </div>
                                    <input
                                                id="pitchVideo"
                                                name="pitchVideo"
                                        type="file"
                                                accept="video/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                        const file = e.target.files[0];
                                                        const fileName = file.name;
                                                        setFormData((prev) => ({ 
                                                            ...prev, 
                                                            pitchVideo: fileName,
                                                            videos: prev.videos.length === 0 ? [fileName] : prev.videos
                                                        }));
                                                        setFileObjects((prev) => ({ ...prev, pitchVideo: file }));
                                                setError('');
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                        {(formData.pitchVideo || formData.videos[0]) && (
                                            <p className="text-sm text-green-600 mt-2">✓ {formData.pitchVideo || formData.videos[0]}</p>
                                        )}
                            </div>

                                    {/* Description for Investor */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, description: e.target.value }));
                                                setError('');
                                            }}
                                            placeholder="Describe your pitch and project"
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                            onFocus={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                                e.currentTarget.style.borderColor = '#0a3d5c';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Upload PITCH Video 2minutes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload PITCH Video 2minutes
                                </label>
                                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                                    <div className="text-center pointer-events-none">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                                <p className="text-sm text-gray-600">{formData.pitchVideo || 'Click to upload video (MP4, MOV, AVI)'}</p>
                                    </div>
                                    <input
                                                id="pitchVideo"
                                                name="pitchVideo"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        const file = e.target.files[0];
                                                        setFormData((prev) => ({ ...prev, pitchVideo: file.name }));
                                                        setFileObjects((prev) => ({ ...prev, pitchVideo: file }));
                                                setError('');
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                        {formData.pitchVideo && <p className="text-sm text-green-600 mt-2">✓ {formData.pitchVideo}</p>}
                            </div>

                                    {/* Upload 9 Photos */}
                            <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload 9 Photos
                                </label>
                                        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                                            <div className="text-center pointer-events-none">
                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-600">{formData.photos.length > 0 ? `${formData.photos.length}/9 photos uploaded` : 'Click to upload photos (up to 9)'}</p>
                                            </div>
                                <input
                                                id="photos"
                                                name="photos"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const files = Array.from(e.target.files).slice(0, 9);
                                                        const fileNames = files.map(f => f.name);
                                                        setFormData((prev) => ({ ...prev, photos: fileNames }));
                                                        setFileObjects((prev) => ({ ...prev, photos: files }));
                                                        setError('');
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                        {formData.photos.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm text-green-600">✓ {formData.photos.length} photo(s) uploaded</p>
                                            </div>
                                        )}
                            </div>

                                    {/* Upload Video 2minutes - Multiple instances */}
                                    {[1, 2].map((index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload Video 2minutes
                                </label>
                                            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                                                <div className="text-center pointer-events-none">
                                                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600">
                                                        {formData.pitchVideos[index - 1] || 'Click to upload video (MP4, MOV, AVI)'}
                                                    </p>
                                                </div>
                                <input
                                                    id={`pitchVideo${index}`}
                                                    name={`pitchVideo${index}`}
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            const fileName = file.name;
                                                            const newVideos = [...formData.pitchVideos];
                                                            newVideos[index - 1] = fileName;
                                                            setFormData((prev) => ({ ...prev, pitchVideos: newVideos }));
                                                            setFileObjects((prev) => {
                                                                const existing = prev.pitchVideos ? [...prev.pitchVideos] : [];
                                                                existing[index - 1] = file;
                                                                return { ...prev, pitchVideos: existing };
                                                            });
                                                            setError('');
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            {formData.pitchVideos[index - 1] && (
                                                <p className="text-sm text-green-600 mt-2">✓ {formData.pitchVideos[index - 1]}</p>
                                            )}
                            </div>
                                    ))}

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, description: e.target.value }));
                                        setError('');
                                    }}
                                    placeholder="Describe your pitch and project"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                />
                            </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-6">
                    {currentStep !== 'usertype' && (
                        <button
                            onClick={handleBack}
                            disabled={loading}
                            className="flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#0a3d5c' }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#062a3d')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0a3d5c')}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Spinner size="sm" variant="white" />
                                Submitting...
                            </span>
                        ) : currentStep === 'pitch' ? (
                            <>
                                Complete
                                {!isOAuthUser && <ChevronRight size={18} />}
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>

                {/* Footer Link */}
                <div className="mt-6 space-y-3 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium" style={{ color: '#0a3d5c' }}>
                            Login here
                        </a>
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-4 py-2 border font-semibold rounded-lg transition-all"
                        style={{ borderColor: '#0a3d5c', color: '#0a3d5c' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Go to Home
                    </button>
                </div>
            </Card>

            {/* OTP Verification Modal */}
            <Dialog 
                open={showOtpModal} 
                onOpenChange={(open) => {
                    // Prevent closing during loading or when OTP is being verified
                    if (!open && !loading && !otpSent) {
                        setShowOtpModal(false);
                        setOtpCode('');
                        setOtpSent(false);
                        setOtpSecondsLeft(0);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verify Your Email</DialogTitle>
                        <DialogDescription>
                            We sent a 6-digit verification code to{' '}
                            <span className="font-semibold text-gray-900">{formData.personalEmail}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
        </div>
                        )}

                        {otpSent ? (
                            <>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800 mb-2">
                                        Code expires in <span className="font-semibold">{Math.max(0, otpSecondsLeft)}s</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        6-digit verification code
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={otpCode}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtpCode(v);
                                            setError('');
                                        }}
                                        placeholder="123456"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none transition text-center text-2xl tracking-widest font-semibold"
                                        style={{
                                            letterSpacing: '0.5em',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#d1d5db';
                                        }}
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={verifyOtpAndRegister}
                                        disabled={loading || otpCode.length !== 6 || otpSecondsLeft <= 0}
                                        className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: '#0a3d5c' }}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Spinner size="sm" variant="white" />
                                                Verifying...
                                            </span>
                                        ) : (
                                            'Verify & Complete Registration'
                                        )}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        disabled={loading || otpSecondsLeft > 0}
                                        className="text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ color: '#0a3d5c' }}
                                        onClick={sendOtpCode}
                                    >
                                        {otpSecondsLeft > 0 ? `Resend code in ${Math.max(0, otpSecondsLeft)}s` : 'Resend code'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <Spinner size="lg" variant="primary" className="mx-auto mb-4" />
                                <p className="text-sm text-gray-600">Sending verification code...</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        </>
    );
}
