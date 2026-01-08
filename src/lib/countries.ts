// Comprehensive countries list with phone codes, flags, and ISO codes
// Flags are provided via country codes that can be used with react-country-flag

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 code
  phoneCode: string; // International dialing code
  flag: string; // Flag emoji for fallback (optional, can use react-country-flag)
}

// Comprehensive list of countries with phone codes
export const countries: Country[] = [
  { name: 'Afghanistan', code: 'AF', phoneCode: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', phoneCode: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', phoneCode: '+213', flag: '🇩🇿' },
  { name: 'Andorra', code: 'AD', phoneCode: '+376', flag: '🇦🇩' },
  { name: 'Angola', code: 'AO', phoneCode: '+244', flag: '🇦🇴' },
  { name: 'Argentina', code: 'AR', phoneCode: '+54', flag: '🇦🇷' },
  { name: 'Armenia', code: 'AM', phoneCode: '+374', flag: '🇦🇲' },
  { name: 'Australia', code: 'AU', phoneCode: '+61', flag: '🇦🇺' },
  { name: 'Austria', code: 'AT', phoneCode: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: 'AZ', phoneCode: '+994', flag: '🇦🇿' },
  { name: 'Bahrain', code: 'BH', phoneCode: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 'BD', phoneCode: '+880', flag: '🇧🇩' },
  { name: 'Belarus', code: 'BY', phoneCode: '+375', flag: '🇧🇾' },
  { name: 'Belgium', code: 'BE', phoneCode: '+32', flag: '🇧🇪' },
  { name: 'Belize', code: 'BZ', phoneCode: '+501', flag: '🇧🇿' },
  { name: 'Benin', code: 'BJ', phoneCode: '+229', flag: '🇧🇯' },
  { name: 'Bhutan', code: 'BT', phoneCode: '+975', flag: '🇧🇹' },
  { name: 'Bolivia', code: 'BO', phoneCode: '+591', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', code: 'BA', phoneCode: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: 'BW', phoneCode: '+267', flag: '🇧🇼' },
  { name: 'Brazil', code: 'BR', phoneCode: '+55', flag: '🇧🇷' },
  { name: 'Brunei', code: 'BN', phoneCode: '+673', flag: '🇧🇳' },
  { name: 'Bulgaria', code: 'BG', phoneCode: '+359', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: 'BF', phoneCode: '+226', flag: '🇧🇫' },
  { name: 'Burundi', code: 'BI', phoneCode: '+257', flag: '🇧🇮' },
  { name: 'Cambodia', code: 'KH', phoneCode: '+855', flag: '🇰🇭' },
  { name: 'Cameroon', code: 'CM', phoneCode: '+237', flag: '🇨🇲' },
  { name: 'Canada', code: 'CA', phoneCode: '+1', flag: '🇨🇦' },
  { name: 'Cape Verde', code: 'CV', phoneCode: '+238', flag: '🇨🇻' },
  { name: 'Central African Republic', code: 'CF', phoneCode: '+236', flag: '🇨🇫' },
  { name: 'Chad', code: 'TD', phoneCode: '+235', flag: '🇹🇩' },
  { name: 'Chile', code: 'CL', phoneCode: '+56', flag: '🇨🇱' },
  { name: 'China', code: 'CN', phoneCode: '+86', flag: '🇨🇳' },
  { name: 'Colombia', code: 'CO', phoneCode: '+57', flag: '🇨🇴' },
  { name: 'Comoros', code: 'KM', phoneCode: '+269', flag: '🇰🇲' },
  { name: 'Congo', code: 'CG', phoneCode: '+242', flag: '🇨🇬' },
  { name: 'Costa Rica', code: 'CR', phoneCode: '+506', flag: '🇨🇷' },
  { name: 'Croatia', code: 'HR', phoneCode: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: 'CU', phoneCode: '+53', flag: '🇨🇺' },
  { name: 'Cyprus', code: 'CY', phoneCode: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: 'CZ', phoneCode: '+420', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', phoneCode: '+45', flag: '🇩🇰' },
  { name: 'Djibouti', code: 'DJ', phoneCode: '+253', flag: '🇩🇯' },
  { name: 'Dominica', code: 'DM', phoneCode: '+1767', flag: '🇩🇲' },
  { name: 'Dominican Republic', code: 'DO', phoneCode: '+1', flag: '🇩🇴' },
  { name: 'Ecuador', code: 'EC', phoneCode: '+593', flag: '🇪🇨' },
  { name: 'Egypt', code: 'EG', phoneCode: '+20', flag: '🇪🇬' },
  { name: 'El Salvador', code: 'SV', phoneCode: '+503', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', code: 'GQ', phoneCode: '+240', flag: '🇬🇶' },
  { name: 'Eritrea', code: 'ER', phoneCode: '+291', flag: '🇪🇷' },
  { name: 'Estonia', code: 'EE', phoneCode: '+372', flag: '🇪🇪' },
  { name: 'Eswatini', code: 'SZ', phoneCode: '+268', flag: '🇸🇿' },
  { name: 'Ethiopia', code: 'ET', phoneCode: '+251', flag: '🇪🇹' },
  { name: 'Fiji', code: 'FJ', phoneCode: '+679', flag: '🇫🇯' },
  { name: 'Finland', code: 'FI', phoneCode: '+358', flag: '🇫🇮' },
  { name: 'France', code: 'FR', phoneCode: '+33', flag: '🇫🇷' },
  { name: 'Gabon', code: 'GA', phoneCode: '+241', flag: '🇬🇦' },
  { name: 'Gambia', code: 'GM', phoneCode: '+220', flag: '🇬🇲' },
  { name: 'Georgia', code: 'GE', phoneCode: '+995', flag: '🇬🇪' },
  { name: 'Germany', code: 'DE', phoneCode: '+49', flag: '🇩🇪' },
  { name: 'Ghana', code: 'GH', phoneCode: '+233', flag: '🇬🇭' },
  { name: 'Greece', code: 'GR', phoneCode: '+30', flag: '🇬🇷' },
  { name: 'Grenada', code: 'GD', phoneCode: '+1473', flag: '🇬🇩' },
  { name: 'Guatemala', code: 'GT', phoneCode: '+502', flag: '🇬🇹' },
  { name: 'Guinea', code: 'GN', phoneCode: '+224', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: 'GW', phoneCode: '+245', flag: '🇬🇼' },
  { name: 'Guyana', code: 'GY', phoneCode: '+592', flag: '🇬🇾' },
  { name: 'Haiti', code: 'HT', phoneCode: '+509', flag: '🇭🇹' },
  { name: 'Honduras', code: 'HN', phoneCode: '+504', flag: '🇭🇳' },
  { name: 'Hong Kong', code: 'HK', phoneCode: '+852', flag: '🇭🇰' },
  { name: 'Hungary', code: 'HU', phoneCode: '+36', flag: '🇭🇺' },
  { name: 'Iceland', code: 'IS', phoneCode: '+354', flag: '🇮🇸' },
  { name: 'India', code: 'IN', phoneCode: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', phoneCode: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', phoneCode: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', phoneCode: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', phoneCode: '+353', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', phoneCode: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', phoneCode: '+39', flag: '🇮🇹' },
  { name: 'Jamaica', code: 'JM', phoneCode: '+1876', flag: '🇯🇲' },
  { name: 'Japan', code: 'JP', phoneCode: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: 'JO', phoneCode: '+962', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: 'KZ', phoneCode: '+7', flag: '🇰🇿' },
  { name: 'Kenya', code: 'KE', phoneCode: '+254', flag: '🇰🇪' },
  { name: 'Kiribati', code: 'KI', phoneCode: '+686', flag: '🇰🇮' },
  { name: 'Kosovo', code: 'XK', phoneCode: '+383', flag: '🇽🇰' },
  { name: 'Kuwait', code: 'KW', phoneCode: '+965', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', code: 'KG', phoneCode: '+996', flag: '🇰🇬' },
  { name: 'Laos', code: 'LA', phoneCode: '+856', flag: '🇱🇦' },
  { name: 'Latvia', code: 'LV', phoneCode: '+371', flag: '🇱🇻' },
  { name: 'Lebanon', code: 'LB', phoneCode: '+961', flag: '🇱🇧' },
  { name: 'Lesotho', code: 'LS', phoneCode: '+266', flag: '🇱🇸' },
  { name: 'Liberia', code: 'LR', phoneCode: '+231', flag: '🇱🇷' },
  { name: 'Libya', code: 'LY', phoneCode: '+218', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: 'LI', phoneCode: '+423', flag: '🇱🇮' },
  { name: 'Lithuania', code: 'LT', phoneCode: '+370', flag: '🇱🇹' },
  { name: 'Luxembourg', code: 'LU', phoneCode: '+352', flag: '🇱🇺' },
  { name: 'Madagascar', code: 'MG', phoneCode: '+261', flag: '🇲🇬' },
  { name: 'Malawi', code: 'MW', phoneCode: '+265', flag: '🇲🇼' },
  { name: 'Malaysia', code: 'MY', phoneCode: '+60', flag: '🇲🇾' },
  { name: 'Maldives', code: 'MV', phoneCode: '+960', flag: '🇲🇻' },
  { name: 'Mali', code: 'ML', phoneCode: '+223', flag: '🇲🇱' },
  { name: 'Malta', code: 'MT', phoneCode: '+356', flag: '🇲🇹' },
  { name: 'Marshall Islands', code: 'MH', phoneCode: '+692', flag: '🇲🇭' },
  { name: 'Mauritania', code: 'MR', phoneCode: '+222', flag: '🇲🇷' },
  { name: 'Mauritius', code: 'MU', phoneCode: '+230', flag: '🇲🇺' },
  { name: 'Mexico', code: 'MX', phoneCode: '+52', flag: '🇲🇽' },
  { name: 'Micronesia', code: 'FM', phoneCode: '+691', flag: '🇫🇲' },
  { name: 'Moldova', code: 'MD', phoneCode: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: 'MC', phoneCode: '+377', flag: '🇲🇨' },
  { name: 'Mongolia', code: 'MN', phoneCode: '+976', flag: '🇲🇳' },
  { name: 'Montenegro', code: 'ME', phoneCode: '+382', flag: '🇲🇪' },
  { name: 'Morocco', code: 'MA', phoneCode: '+212', flag: '🇲🇦' },
  { name: 'Mozambique', code: 'MZ', phoneCode: '+258', flag: '🇲🇿' },
  { name: 'Myanmar', code: 'MM', phoneCode: '+95', flag: '🇲🇲' },
  { name: 'Namibia', code: 'NA', phoneCode: '+264', flag: '🇳🇦' },
  { name: 'Nauru', code: 'NR', phoneCode: '+674', flag: '🇳🇷' },
  { name: 'Nepal', code: 'NP', phoneCode: '+977', flag: '🇳🇵' },
  { name: 'Netherlands', code: 'NL', phoneCode: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', phoneCode: '+64', flag: '🇳🇿' },
  { name: 'Nicaragua', code: 'NI', phoneCode: '+505', flag: '🇳🇮' },
  { name: 'Niger', code: 'NE', phoneCode: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', code: 'NG', phoneCode: '+234', flag: '🇳🇬' },
  { name: 'North Macedonia', code: 'MK', phoneCode: '+389', flag: '🇲🇰' },
  { name: 'Norway', code: 'NO', phoneCode: '+47', flag: '🇳🇴' },
  { name: 'Oman', code: 'OM', phoneCode: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', code: 'PK', phoneCode: '+92', flag: '🇵🇰' },
  { name: 'Palau', code: 'PW', phoneCode: '+680', flag: '🇵🇼' },
  { name: 'Palestine', code: 'PS', phoneCode: '+970', flag: '🇵🇸' },
  { name: 'Panama', code: 'PA', phoneCode: '+507', flag: '🇵🇦' },
  { name: 'Papua New Guinea', code: 'PG', phoneCode: '+675', flag: '🇵🇬' },
  { name: 'Paraguay', code: 'PY', phoneCode: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: 'PE', phoneCode: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: 'PH', phoneCode: '+63', flag: '🇵🇭' },
  { name: 'Poland', code: 'PL', phoneCode: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', phoneCode: '+351', flag: '🇵🇹' },
  { name: 'Qatar', code: 'QA', phoneCode: '+974', flag: '🇶🇦' },
  { name: 'Romania', code: 'RO', phoneCode: '+40', flag: '🇷🇴' },
  { name: 'Russia', code: 'RU', phoneCode: '+7', flag: '🇷🇺' },
  { name: 'Rwanda', code: 'RW', phoneCode: '+250', flag: '🇷🇼' },
  { name: 'Saint Kitts and Nevis', code: 'KN', phoneCode: '+1869', flag: '🇰🇳' },
  { name: 'Saint Lucia', code: 'LC', phoneCode: '+1758', flag: '🇱🇨' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', phoneCode: '+1784', flag: '🇻🇨' },
  { name: 'Samoa', code: 'WS', phoneCode: '+685', flag: '🇼🇸' },
  { name: 'San Marino', code: 'SM', phoneCode: '+378', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', code: 'ST', phoneCode: '+239', flag: '🇸🇹' },
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', flag: '🇸🇦' },
  { name: 'Senegal', code: 'SN', phoneCode: '+221', flag: '🇸🇳' },
  { name: 'Serbia', code: 'RS', phoneCode: '+381', flag: '🇷🇸' },
  { name: 'Seychelles', code: 'SC', phoneCode: '+248', flag: '🇸🇨' },
  { name: 'Sierra Leone', code: 'SL', phoneCode: '+232', flag: '🇸🇱' },
  { name: 'Singapore', code: 'SG', phoneCode: '+65', flag: '🇸🇬' },
  { name: 'Slovakia', code: 'SK', phoneCode: '+421', flag: '🇸🇰' },
  { name: 'Slovenia', code: 'SI', phoneCode: '+386', flag: '🇸🇮' },
  { name: 'Solomon Islands', code: 'SB', phoneCode: '+677', flag: '🇸🇧' },
  { name: 'Somalia', code: 'SO', phoneCode: '+252', flag: '🇸🇴' },
  { name: 'South Africa', code: 'ZA', phoneCode: '+27', flag: '🇿🇦' },
  { name: 'South Korea', code: 'KR', phoneCode: '+82', flag: '🇰🇷' },
  { name: 'South Sudan', code: 'SS', phoneCode: '+211', flag: '🇸🇸' },
  { name: 'Spain', code: 'ES', phoneCode: '+34', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', phoneCode: '+94', flag: '🇱🇰' },
  { name: 'Sudan', code: 'SD', phoneCode: '+249', flag: '🇸🇩' },
  { name: 'Suriname', code: 'SR', phoneCode: '+597', flag: '🇸🇷' },
  { name: 'Sweden', code: 'SE', phoneCode: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', phoneCode: '+41', flag: '🇨🇭' },
  { name: 'Syria', code: 'SY', phoneCode: '+963', flag: '🇸🇾' },
  { name: 'Taiwan', code: 'TW', phoneCode: '+886', flag: '🇹🇼' },
  { name: 'Tajikistan', code: 'TJ', phoneCode: '+992', flag: '🇹🇯' },
  { name: 'Tanzania', code: 'TZ', phoneCode: '+255', flag: '🇹🇿' },
  { name: 'Thailand', code: 'TH', phoneCode: '+66', flag: '🇹🇭' },
  { name: 'Timor-Leste', code: 'TL', phoneCode: '+670', flag: '🇹🇱' },
  { name: 'Togo', code: 'TG', phoneCode: '+228', flag: '🇹🇬' },
  { name: 'Tonga', code: 'TO', phoneCode: '+676', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', code: 'TT', phoneCode: '+1868', flag: '🇹🇹' },
  { name: 'Tunisia', code: 'TN', phoneCode: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: 'TR', phoneCode: '+90', flag: '🇹🇷' },
  { name: 'Turkmenistan', code: 'TM', phoneCode: '+993', flag: '🇹🇲' },
  { name: 'Tuvalu', code: 'TV', phoneCode: '+688', flag: '🇹🇻' },
  { name: 'Uganda', code: 'UG', phoneCode: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', phoneCode: '+380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', phoneCode: '+1', flag: '🇺🇸' },
  { name: 'Uruguay', code: 'UY', phoneCode: '+598', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: 'UZ', phoneCode: '+998', flag: '🇺🇿' },
  { name: 'Vanuatu', code: 'VU', phoneCode: '+678', flag: '🇻🇺' },
  { name: 'Vatican City', code: 'VA', phoneCode: '+39', flag: '🇻🇦' },
  { name: 'Venezuela', code: 'VE', phoneCode: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', phoneCode: '+84', flag: '🇻🇳' },
  { name: 'Yemen', code: 'YE', phoneCode: '+967', flag: '🇾🇪' },
  { name: 'Zambia', code: 'ZM', phoneCode: '+260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: 'ZW', phoneCode: '+263', flag: '🇿🇼' },
];

// Helper function to get country by ISO code
export const getCountryByCode = (code: string): Country | undefined => {
  if (!code) return undefined;
  // Normalize to uppercase for matching
  const normalizedCode = code.trim().toUpperCase();
  return countries.find(c => c.code.toUpperCase() === normalizedCode);
};

// Helper function to get country by name
export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(c => c.name.toLowerCase() === name.toLowerCase());
};

// Helper function to get country by phone code
// Note: Returns the FIRST country with this phone code. 
// For +1 (US/Canada), use getCountryByCode instead if you have the ISO code
export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(c => c.phoneCode === phoneCode);
};

// Helper function to get country by phone code with preference for a specific country code
// Useful when multiple countries share the same phone code (e.g., US/Canada with +1)
export const getCountryByPhoneCodeWithPreference = (
  phoneCode: string, 
  preferredCountryCode?: string
): Country | undefined => {
  if (!preferredCountryCode) {
    return getCountryByPhoneCode(phoneCode);
  }
  
  // First try to find by preferred country code
  const preferred = countries.find(
    c => c.phoneCode === phoneCode && c.code.toUpperCase() === preferredCountryCode.toUpperCase()
  );
  
  if (preferred) return preferred;
  
  // Fallback to first match
  return getCountryByPhoneCode(phoneCode);
};

// Sort countries alphabetically
export const getSortedCountries = (): Country[] => {
  return [...countries].sort((a, b) => a.name.localeCompare(b.name));
};
