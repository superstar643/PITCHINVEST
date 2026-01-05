import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Step = 'usertype' | 'company' | 'personal' | 'pitch';

// Country mapping with flags and phone codes
const countries = [
    { name: 'Portugal', flag: '/assets/flags/PT.png', code: 'PT', phoneCode: '+351' },
    { name: 'Spain', flag: '/assets/flags/ES.png', code: 'ES', phoneCode: '+34' },
    { name: 'France', flag: '/assets/flags/FR.png', code: 'FR', phoneCode: '+33' },
    { name: 'Germany', flag: '/assets/flags/DE.png', code: 'DE', phoneCode: '+49' },
    { name: 'Italy', flag: '/assets/flags/IT.png', code: 'IT', phoneCode: '+39' },
    { name: 'United Kingdom', flag: '/assets/flags/GB.png', code: 'GB', phoneCode: '+44' },
    { name: 'United States', flag: '/assets/flags/US.png', code: 'US', phoneCode: '+1' },
    { name: 'Brazil', flag: '/assets/flags/BR.png', code: 'BR', phoneCode: '+55' },
    { name: 'Other', flag: '', code: 'OTHER', phoneCode: '+' },
];

export default function Register() {
    const [currentStep, setCurrentStep] = useState<Step>('usertype');
    const [phoneCountryCode, setPhoneCountryCode] = useState('+1'); // Default to US for personal telephone
    const [companyPhoneCountryCode, setCompanyPhoneCountryCode] = useState('+1'); // Default to US for company telephone
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

    const userTypes = ['Inventor', 'StartUp', 'Company', 'Investor'];

    const steps: { id: Step; title: string; description: string }[] = useMemo(() => [
        { id: 'usertype', title: 'User Role', description: 'Select your role' },
        { 
            id: 'company', 
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
        { id: 'personal', title: 'Personal Info', description: 'Tell us about yourself' },
        { id: 'pitch', title: 'Pitch Info', description: formData.userType === 'Investor' ? 'Complete your profile' : 'Upload your pitch materials' },
    ], [formData.userType]);

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
                if (formData.userType === 'Inventor') {
                    // Inventor validation
                    if (!formData.inventorName.trim()) {
                        setError('Please enter inventor name');
                        return false;
                    }
                    if (!formData.projectName.trim()) {
                        setError('Please enter your project name');
                        return false;
                    }
                    if (!formData.projectCategory.trim()) {
                        setError('Please enter project category');
                        return false;
                    }
                    if (!formData.licenseNumber.trim()) {
                        setError('Please enter license number');
                        return false;
                    }
                    if (!formData.releaseDate.trim()) {
                        setError('Please enter release date');
                        return false;
                    }
                    if (!formData.initialLicenseValue.trim()) {
                        setError('Please enter initial license value');
                        return false;
                    }
                    if (!formData.exploitationLicenseRoyalty.trim()) {
                        setError('Please enter exploitation license patent royalty');
                        return false;
                    }
                    if (!formData.patentSale.trim()) {
                        setError('Please enter 100% patent sale value');
                        return false;
                    }
                    if (!formData.investorsCount.trim()) {
                        setError('Please enter number of investors');
                        return false;
                    }
                } else if (formData.userType === 'StartUp') {
                    // StartUp validation
                    if (!formData.smartMoney.trim()) {
                        setError('Please enter Smart Money');
                        return false;
                    }
                    if (!formData.companyName.trim()) {
                        setError('Please enter your company name');
                        return false;
                    }
                    if (!formData.projectName.trim()) {
                        setError('Please enter your project name');
                        return false;
                    }
                    if (!formData.projectCategory.trim()) {
                        setError('Please enter project category');
                        return false;
                    }
                    if (!formData.companyNIF.trim()) {
                        setError('Please enter your company NIF');
                        return false;
                    }
                    if (!formData.companyTelephone.trim()) {
                        setError('Please enter your company telephone');
                        return false;
                    }
                    const companyPhoneError = validatePhoneNumber(formData.companyTelephone, companyPhoneCountryCode);
                    if (companyPhoneError) {
                        setCompanyTelephoneError(companyPhoneError);
                        setError(companyPhoneError);
                        return false;
                    }
                } else if (formData.userType === 'Company') {
                    // Company validation
                    if (!formData.companyName.trim()) {
                        setError('Please enter your company name');
                        return false;
                    }
                    if (!formData.projectName.trim()) {
                        setError('Please enter your project name');
                        return false;
                    }
                    if (!formData.projectCategory.trim()) {
                        setError('Please enter project category');
                        return false;
                    }
                    if (!formData.companyNIF.trim()) {
                        setError('Please enter your company NIF');
                        return false;
                    }
                    if (!formData.companyTelephone.trim()) {
                        setError('Please enter your company telephone');
                        return false;
                    }
                    const companyPhoneError = validatePhoneNumber(formData.companyTelephone, companyPhoneCountryCode);
                    if (companyPhoneError) {
                        setCompanyTelephoneError(companyPhoneError);
                        setError(companyPhoneError);
                        return false;
                    }
                } else if (formData.userType === 'Investor') {
                    // Investor validation
                    if (!formData.fullName.trim()) {
                        setError('Please enter your full name');
                        return false;
                    }
                    if (!formData.projectCategory.trim()) {
                        setError('Please enter project category interest');
                        return false;
                    }
                }
                // Note: Commercial proposal fields are optional for all types
                // Users can fill any combination of blocks
                return true;

            case 'personal':
                if (!formData.coverImage) {
                    setError('Please upload a cover image');
                    return false;
                }
                if (!formData.photo) {
                    setError('Please upload a photo');
                    return false;
                }
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
                // Investors don't need pitch materials
                if (formData.userType === 'Investor') {
                    if (!formData.pitchVideo && formData.videos.length === 0) {
                        setError('Please upload at least one video');
                        return false;
                    }
                    if (!formData.description.trim()) {
                        setError('Please enter a description');
                        return false;
                    }
                    return true;
                }
                // For Inventor, StartUp, Company
                if (!formData.pitchVideo) {
                    setError('Please upload PITCH Video 2minutes');
                    return false;
                }
                if (formData.photos.length === 0) {
                    setError('Please upload photos');
                    return false;
                }
                if (formData.pitchVideos.filter(v => v).length === 0) {
                    setError('Please upload at least one Video 2minutes');
                    return false;
                }
                if (!formData.description.trim()) {
                    setError('Please enter a description');
                    return false;
                }
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
            setCurrentStep('personal');
        } else if (currentStep === 'personal') {
            setCurrentStep('pitch');
        } else if (currentStep === 'pitch') {
            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                console.log('Registration complete:', {
                    userType: formData.userType,
                    companyName: formData.companyName,
                    projectName: formData.projectName,
                    companyNIF: formData.companyNIF,
                    companyTelephone: formData.companyTelephone,
                    // Commercial Proposal Options
                    equityParticipation: {
                        capitalPercentage: formData.capitalPercentage,
                        capitalTotalValue: formData.capitalTotalValue,
                    },
                    brandLicensing: {
                        licenseFee: formData.licenseFee,
                        licensingRoyaltiesPercentage: formData.licensingRoyaltiesPercentage,
                    },
                    franchising: {
                        franchiseeInvestment: formData.franchiseeInvestment,
                        monthlyRoyalties: formData.monthlyRoyalties,
                    },
                    fullName: formData.fullName,
                    personalEmail: formData.personalEmail,
                    telephone: formData.telephone,
                    country: formData.country,
                    city: formData.city,
                    pitchFile: formData.pitchFile,
                    videos: formData.videos,
                    description: formData.description,
                });
                setLoading(false);
                alert('Registration successful! Your information has been submitted.');
                // Here you would typically call an API and handle registration
            }, 1500);
        }
    };

    const handleBack = () => {
        if (currentStep === 'company') {
            setCurrentStep('usertype');
        } else if (currentStep === 'personal') {
            setCurrentStep('company');
        } else if (currentStep === 'pitch') {
            setCurrentStep('personal');
        }
    };

    return (
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

                                    {/* Initial License Value */}
                                    <div>
                                        <label htmlFor="initialLicenseValue" className="block text-sm font-medium text-gray-700 mb-1">
                                            Initial License Value ($)
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

                                    {/* Exploitation License Patent Royalty */}
                                    <div>
                                        <label htmlFor="exploitationLicenseRoyalty" className="block text-sm font-medium text-gray-700 mb-1">
                                            Exploitation License Patent Royalty
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

                                    {/* 100% Patent Sale */}
                                    <div>
                                        <label htmlFor="patentSale" className="block text-sm font-medium text-gray-700 mb-1">
                                            100% Patent Sale
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

                                    {/* Commercial Proposal Options - All 4 blocks for Inventor */}
                                    <div className="space-y-6 mt-6">
                                        {/* Block 1: Equity Participation */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Equity Participation</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="capitalPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Capital Percentage
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
                                                        Total Value
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

                                        {/* Block 2: Brand Licensing */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Brand Licensing (Exploitation)</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="licenseFee" className="block text-sm font-medium text-gray-700 mb-1">
                                                        License Fee
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
                                                        Royalties Percentage
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

                                        {/* Block 3: Franchising */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Franchising</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="franchiseeInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Franchisee Investment
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
                                                        Monthly Royalties
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

                                        {/* Block 4: Patent Licensing - Highlighted for Inventor */}
                                        <div className="border border-[#0a3d5c] rounded-lg p-5 bg-blue-50/30">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">
                                                Patent Licensing
                                                <span className="ml-2 text-xs text-[#0a3d5c]">(Primary)</span>
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="initialLicenseValue" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Upfront Fee
                                                    </label>
                                                    <input
                                                        id="initialLicenseValue"
                                                        name="initialLicenseValue"
                                                        type="text"
                                                        value={formData.initialLicenseValue}
                                                        onChange={handleChange}
                                                        placeholder="e.g., $10,000"
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
                                                    <label htmlFor="exploitationLicenseRoyalty" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Royalties (%)
                                                    </label>
                                                    <input
                                                        id="exploitationLicenseRoyalty"
                                                        name="exploitationLicenseRoyalty"
                                                        type="text"
                                                        value={formData.exploitationLicenseRoyalty}
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
                                    <Select
                                        value={companyPhoneCountryCode}
                                        onValueChange={(value) => {
                                            setCompanyPhoneCountryCode(value);
                                            // Re-validate when country code changes
                                            if (formData.companyTelephone) {
                                                const phoneError = validatePhoneNumber(formData.companyTelephone, value);
                                                setCompanyTelephoneError(phoneError);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-auto min-w-[100px] border-0 rounded-none border-r border-gray-300 rounded-l-lg focus:ring-0 focus:ring-offset-0 h-auto py-2 px-3">
                                            {(() => {
                                                const selectedCountry = countries.find(c => c.phoneCode === companyPhoneCountryCode);
                                                if (selectedCountry && selectedCountry.flag) {
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={selectedCountry.flag} 
                                                                alt={selectedCountry.name}
                                                                className="w-5 h-4 object-cover flex-shrink-0"
                                                            />
                                                            <span className="text-sm text-gray-900">{selectedCountry.phoneCode}</span>
                                                        </div>
                                                    );
                                                }
                                                return <SelectValue>{companyPhoneCountryCode}</SelectValue>;
                                            })()}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.filter(country => country.name !== 'Other').map((country) => (
                                                <SelectItem key={country.phoneCode} value={country.phoneCode}>
                                                    <div className="flex items-center gap-3">
                                                        {country.flag && (
                                                            <img 
                                                                src={country.flag} 
                                                                alt={country.name}
                                                                className="w-5 h-4 object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <span>{country.phoneCode} {country.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
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
                                {/* Block 1: Equity Participation - Highlighted for StartUp */}
                                <div className={`border rounded-lg p-5 ${formData.userType === 'StartUp' ? 'border-[#0a3d5c] bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                                Equity Participation
                                        {formData.userType === 'StartUp' && <span className="ml-2 text-xs text-[#0a3d5c]">(Primary)</span>}
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="capitalPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                Capital Percentage
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
                                                Total Value
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

                                {/* Block 2: Brand Licensing (Exploitation) */}
                                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">Brand Licensing (Exploitation)</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="licenseFee" className="block text-sm font-medium text-gray-700 mb-1">
                                                License Fee
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
                                                Royalties Percentage
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

                                {/* Block 3: Franchising */}
                                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">Franchising</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="franchiseeInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                                                Franchisee Investment
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
                                                Monthly Royalties
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

                                {/* Block 4: Patent Licensing */}
                                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">Patent Licensing</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="initialLicenseValue" className="block text-sm font-medium text-gray-700 mb-1">
                                                Upfront Fee
                                            </label>
                                            <input
                                                id="initialLicenseValue"
                                                name="initialLicenseValue"
                                                type="text"
                                                value={formData.initialLicenseValue}
                                                onChange={handleChange}
                                                placeholder="e.g., $10,000"
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
                                            <label htmlFor="exploitationLicenseRoyalty" className="block text-sm font-medium text-gray-700 mb-1">
                                                Royalties (%)
                                            </label>
                                            <input
                                                id="exploitationLicenseRoyalty"
                                                name="exploitationLicenseRoyalty"
                                                type="text"
                                                value={formData.exploitationLicenseRoyalty}
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
                                            <Select
                                                value={companyPhoneCountryCode}
                                                onValueChange={(value) => {
                                                    setCompanyPhoneCountryCode(value);
                                                    if (formData.companyTelephone) {
                                                        const phoneError = validatePhoneNumber(formData.companyTelephone, value);
                                                        setCompanyTelephoneError(phoneError);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-auto min-w-[100px] border-0 rounded-none border-r border-gray-300 rounded-l-lg focus:ring-0 focus:ring-offset-0 h-auto py-2 px-3">
                                                    {(() => {
                                                        const selectedCountry = countries.find(c => c.phoneCode === companyPhoneCountryCode);
                                                        if (selectedCountry && selectedCountry.flag) {
                                                            return (
                                                                <div className="flex items-center gap-3">
                                                                    <img 
                                                                        src={selectedCountry.flag} 
                                                                        alt={selectedCountry.name}
                                                                        className="w-5 h-4 object-cover flex-shrink-0"
                                                                    />
                                                                    <span className="text-sm text-gray-900">{selectedCountry.phoneCode}</span>
                                                                </div>
                                                            );
                                                        }
                                                        return <SelectValue>{companyPhoneCountryCode}</SelectValue>;
                                                    })()}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.filter(country => country.name !== 'Other').map((country) => (
                                                        <SelectItem key={country.phoneCode} value={country.phoneCode}>
                                                            <div className="flex items-center gap-3">
                                                                {country.flag && (
                                                                    <img 
                                                                        src={country.flag} 
                                                                        alt={country.name}
                                                                        className="w-5 h-4 object-cover flex-shrink-0"
                                                                    />
                                                                )}
                                                                <span>{country.phoneCode} {country.name}</span>
                        </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                        {/* Block 1: Equity Participation */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Equity Participation</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="capitalPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Capital Percentage
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
                                                        Total Value
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

                                        {/* Block 2: Brand Licensing */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Brand Licensing (Exploitation)</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="licenseFee" className="block text-sm font-medium text-gray-700 mb-1">
                                                        License Fee
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
                                                        Royalties Percentage
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

                                        {/* Block 3: Franchising - Highlighted for Company */}
                                        <div className={`border rounded-lg p-5 ${formData.userType === 'Company' ? 'border-[#0a3d5c] bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">
                                                Franchising
                                                {formData.userType === 'Company' && <span className="ml-2 text-xs text-[#0a3d5c]">(Primary)</span>}
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="franchiseeInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Franchisee Investment
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
                                                        Monthly Royalties
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

                                        {/* Block 4: Patent Licensing */}
                                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                                            <h3 className="text-base font-semibold text-gray-800 mb-4">Patent Licensing</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="initialLicenseValue" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Upfront Fee
                                                    </label>
                                                    <input
                                                        id="initialLicenseValue"
                                                        name="initialLicenseValue"
                                                        type="text"
                                                        value={formData.initialLicenseValue}
                                                        onChange={handleChange}
                                                        placeholder="e.g., $10,000"
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
                                                    <label htmlFor="exploitationLicenseRoyalty" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Royalties (%)
                                                    </label>
                                                    <input
                                                        id="exploitationLicenseRoyalty"
                                                        name="exploitationLicenseRoyalty"
                                                        type="text"
                                                        value={formData.exploitationLicenseRoyalty}
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
                                                setError('');
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
                                >
                                    {formData.coverImagePreview ? (
                                        <div className="w-full">
                                            <img src={formData.coverImagePreview} alt="Cover preview" className="w-full h-40 object-cover rounded-lg mb-2" />
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
                                                    setError('');
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* User Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Photo
                                </label>
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
                                                setError('');
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
                                >
                                    {formData.photoPreview ? (
                                        <div className="w-full flex justify-center">
                                            <div className="w-32 h-32">
                                                <img src={formData.photoPreview} alt="Photo preview" className="w-full h-full object-cover rounded-full" style={{ borderColor: '#0a3d5c', borderWidth: '2px' }} />
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
                                                    setError('');
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
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
                                    <Select
                                        value={phoneCountryCode}
                                        onValueChange={(value) => {
                                            setPhoneCountryCode(value);
                                            // Re-validate when country code changes
                                            if (formData.telephone) {
                                                const phoneError = validatePhoneNumber(formData.telephone, value);
                                                setTelephoneError(phoneError);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-auto min-w-[100px] border-0 rounded-none border-r border-gray-300 rounded-l-lg focus:ring-0 focus:ring-offset-0 h-auto py-2 px-3">
                                            {(() => {
                                                const selectedCountry = countries.find(c => c.phoneCode === phoneCountryCode);
                                                if (selectedCountry && selectedCountry.flag) {
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={selectedCountry.flag} 
                                                                alt={selectedCountry.name}
                                                                className="w-5 h-4 object-cover flex-shrink-0"
                                                            />
                                                            <span className="text-sm text-gray-900">{selectedCountry.phoneCode}</span>
                                                        </div>
                                                    );
                                                }
                                                return <SelectValue>{phoneCountryCode}</SelectValue>;
                                            })()}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.filter(country => country.name !== 'Other').map((country) => (
                                                <SelectItem key={country.phoneCode} value={country.phoneCode}>
                                                    <div className="flex items-center gap-3">
                                                        {country.flag && (
                                                            <img 
                                                                src={country.flag} 
                                                                alt={country.name}
                                                                className="w-5 h-4 object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <span>{country.phoneCode} {country.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
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
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({ ...prev, country: value }));
                                        setError('');
                                    }}
                                >
                                    <SelectTrigger
                                        id="country"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition h-auto min-h-[42px]"
                                        onFocus={(e) => {
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                            e.currentTarget.style.borderColor = '#0a3d5c';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#d1d5db';
                                        }}
                                    >
                                        {formData.country ? (() => {
                                            const selectedCountry = countries.find(c => c.name === formData.country);
                                            if (selectedCountry) {
                                                return (
                                                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                                                        {selectedCountry.flag && (
                                                            <img 
                                                                src={selectedCountry.flag} 
                                                                alt={selectedCountry.name}
                                                                className="w-5 h-4 object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <span className="text-sm text-gray-900 truncate">{selectedCountry.name}</span>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                                                    <span className="text-sm text-gray-900 truncate">{formData.country}</span>
                                                </div>
                                            );
                                        })() : (
                                            <SelectValue placeholder="Select a country" className="flex-1 text-left mr-2" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem key={country.name} value={country.name}>
                                                <div className="flex items-center gap-3">
                                                    {country.flag && (
                                                        <img 
                                                            src={country.flag} 
                                                            alt={country.name}
                                                            className="w-5 h-4 object-cover flex-shrink-0"
                                                        />
                                                    )}
                                                    <span>{country.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                                        const fileName = e.target.files[0].name;
                                                        setFormData((prev) => ({ 
                                                            ...prev, 
                                                            pitchVideo: fileName,
                                                            videos: prev.videos.length === 0 ? [fileName] : prev.videos
                                                        }));
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
                                                        setFormData((prev) => ({ ...prev, pitchVideo: e.target.files![0].name }));
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
                                                        const fileNames = Array.from(e.target.files).slice(0, 9).map(f => f.name);
                                                        setFormData((prev) => ({ ...prev, photos: fileNames }));
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
                                                            const fileName = e.target.files[0].name;
                                                            const newVideos = [...formData.pitchVideos];
                                                            newVideos[index - 1] = fileName;
                                                            setFormData((prev) => ({ ...prev, pitchVideos: newVideos }));
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#062a3d'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a3d5c'}
                    >
                        {loading ? (
                            'Submitting...'
                        ) : currentStep === 'pitch' ? (
                            <>
                                Complete
                                <ChevronRight size={18} />
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
        </div>
    );
}
