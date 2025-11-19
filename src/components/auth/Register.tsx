import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 'usertype' | 'company' | 'personal' | 'pitch';

export default function Register() {
    const [currentStep, setCurrentStep] = useState<Step>('usertype');
    const [formData, setFormData] = useState({
        userType: '',
        companyName: '',
        projectName: '',
        companyNIF: '',
        companyTelephone: '',
        percentage: '',
        percentageRoyalties: '',
        royaltyExample: '',
        totalSale: '',
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
        factSheet: '',
        technicalSheet: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const userTypes = ['Inventor', 'StartUp', 'Investor'];

    const steps: { id: Step; title: string; description: string }[] = [
        { id: 'usertype', title: 'User Role', description: 'Select your role' },
        { id: 'company', title: 'Company Info', description: 'Tell us about your company' },
        { id: 'personal', title: 'Personal Info', description: 'Tell us about yourself' },
        { id: 'pitch', title: 'Pitch Info', description: 'Upload your pitch materials' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
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
                if (!formData.companyName.trim()) {
                    setError('Please enter your company name');
                    return false;
                }
                if (!formData.projectName.trim()) {
                    setError('Please enter your project name');
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
                if (!formData.percentage.trim()) {
                    setError('Please enter your percentage');
                    return false;
                }
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
                if (!formData.pitchFile) {
                    setError('Please upload a pitch file');
                    return false;
                }
                if (formData.videos.length === 0) {
                    setError('Please upload at least one video');
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
                    percentage: formData.percentage,
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
                    <div className="flex items-center justify-between mb-4">
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
                                <span className="text-xs text-gray-600 text-center">{step.title}</span>
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

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Step 2: Company Info */}
                    {currentStep === 'company' && (
                        <div className="space-y-4">
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
                                    style={{ 
                                        '--tw-ring-color': '#0a3d5c'
                                    } as any}
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
                                <input
                                    id="companyTelephone"
                                    name="companyTelephone"
                                    type="tel"
                                    value={formData.companyTelephone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
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
                                <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
                                    Percentage
                                </label>
                                <input
                                    id="percentage"
                                    name="percentage"
                                    type="number"
                                    value={formData.percentage}
                                    onChange={handleChange}
                                    placeholder="e.g., 25"
                                    min="0"
                                    max="100"
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
                                <label htmlFor="percentageRoyalties" className="block text-sm font-medium text-gray-700 mb-1">
                                    Percentage + Royalties Ex.
                                </label>
                                <input
                                    id="percentageRoyalties"
                                    name="percentageRoyalties"
                                    type="text"
                                    value={formData.percentageRoyalties}
                                    onChange={handleChange}
                                    placeholder="e.g., 25% + 5%"
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
                                <label htmlFor="royaltyExample" className="block text-sm font-medium text-gray-700 mb-1">
                                    Royalty Ex.
                                </label>
                                <input
                                    id="royaltyExample"
                                    name="royaltyExample"
                                    type="text"
                                    value={formData.royaltyExample}
                                    onChange={handleChange}
                                    placeholder="e.g., $5,000"
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
                                <label htmlFor="totalSale" className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Sale Ex.
                                </label>
                                <input
                                    id="totalSale"
                                    name="totalSale"
                                    type="text"
                                    value={formData.totalSale}
                                    onChange={handleChange}
                                    placeholder="e.g., $100,000"
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
                                <input
                                    id="telephone"
                                    name="telephone"
                                    type="tel"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
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
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, country: e.target.value }));
                                        setError('');
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                                    onFocus={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                                        e.currentTarget.style.borderColor = '#0a3d5c';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    <option value="">Select a country</option>
                                    <option value="Portugal">Portugal</option>
                                    <option value="Spain">Spain</option>
                                    <option value="France">France</option>
                                    <option value="Germany">Germany</option>
                                    <option value="Italy">Italy</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="United States">United States</option>
                                    <option value="Brazil">Brazil</option>
                                    <option value="Other">Other</option>
                                </select>
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
                            {/* Pitch File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Pitch
                                </label>
                                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                                    <div className="text-center pointer-events-none">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm text-gray-600">{formData.pitchFile || 'Click to upload pitch file (PDF, PPTX, DOC)'}</p>
                                    </div>
                                    <input
                                        id="pitchFile"
                                        name="pitchFile"
                                        type="file"
                                        accept=".pdf,.pptx,.doc,.docx"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setFormData((prev) => ({ ...prev, pitchFile: e.target.files![0].name }));
                                                setError('');
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                {formData.pitchFile && <p className="text-sm text-green-600 mt-2">✓ {formData.pitchFile}</p>}
                            </div>

                            {/* Videos Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Videos (Multiple)
                                </label>
                                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                                    <div className="text-center pointer-events-none">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-600">Click to upload videos (MP4, MOV, AVI)</p>
                                    </div>
                                    <input
                                        id="videos"
                                        name="videos"
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const fileNames = Array.from(e.target.files).map(f => f.name);
                                                setFormData((prev) => ({ ...prev, videos: fileNames }));
                                                setError('');
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                {formData.videos.length > 0 && (
                                    <div className="mt-2">
                                        {formData.videos.map((video, index) => (
                                            <p key={index} className="text-sm text-green-600">✓ {video}</p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fact Sheet */}
                            <div>
                                <label htmlFor="factSheet" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fact Sheet (Optional)
                                </label>
                                <input
                                    id="factSheet"
                                    name="factSheet"
                                    type="text"
                                    value={formData.factSheet}
                                    onChange={handleChange}
                                    placeholder="Add fact sheet information"
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

                            {/* Technical Sheet */}
                            <div>
                                <label htmlFor="technicalSheet" className="block text-sm font-medium text-gray-700 mb-1">
                                    Technical Sheet (Optional)
                                </label>
                                <input
                                    id="technicalSheet"
                                    name="technicalSheet"
                                    type="text"
                                    value={formData.technicalSheet}
                                    onChange={handleChange}
                                    placeholder="Add technical sheet information"
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
