// IP-based Geolocation utility
// Uses multiple fallback services for better reliability

export interface GeolocationData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  timezone?: string;
  ip?: string;
}

// Primary service: ipapi.co (free tier: 1000 requests/day)
const fetchFromIpApi = async (): Promise<GeolocationData | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('ipapi.co request failed');
    
    const data = await response.json();
    if (data.error) throw new Error(data.reason || 'ipapi.co error');
    
    return {
      country: data.country_name || '',
      countryCode: data.country_code || '',
      city: data.city || '',
      region: data.region || '',
      timezone: data.timezone || '',
      ip: data.ip || '',
    };
  } catch (error) {
    console.warn('ipapi.co geolocation failed:', error);
    return null;
  }
};

// Fallback service: ip-api.com (free tier: 45 requests/minute)
const fetchFromIpApiCom = async (): Promise<GeolocationData | null> => {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,city,regionName,timezone,query');
    if (!response.ok) throw new Error('ip-api.com request failed');
    
    const data = await response.json();
    if (data.status === 'fail') throw new Error(data.message || 'ip-api.com error');
    
    return {
      country: data.country || '',
      countryCode: data.countryCode || '',
      city: data.city || '',
      region: data.regionName || '',
      timezone: data.timezone || '',
      ip: data.query || '',
    };
  } catch (error) {
    console.warn('ip-api.com geolocation failed:', error);
    return null;
  }
};

// Fallback service: ipify.org + ipgeolocation.io (free tier: 1000 requests/month)
const fetchFromIpGeolocation = async (): Promise<GeolocationData | null> => {
  try {
    // First get IP from ipify
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (!ipResponse.ok) throw new Error('ipify request failed');
    
    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    
    if (!ip) throw new Error('No IP address received');
    
    // Then get geolocation from ipgeolocation (requires API key, but has free tier)
    // For now, we'll skip this as it requires registration
    // Can be added later if needed
    return null;
  } catch (error) {
    console.warn('ipgeolocation geolocation failed:', error);
    return null;
  }
};

// Fallback service: ipwho.is (free, no API key required)
const fetchFromIpWhoIs = async (): Promise<GeolocationData | null> => {
  try {
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) throw new Error('ipwho.is request failed');
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'ipwho.is error');
    
    return {
      country: data.country || '',
      countryCode: data.country_code || '',
      city: data.city || '',
      region: data.region || '',
      timezone: data.timezone?.id || '',
      ip: data.ip || '',
    };
  } catch (error) {
    console.warn('ipwho.is geolocation failed:', error);
    return null;
  }
};

/**
 * Get user's geolocation based on IP address
 * Tries multiple services with fallback for reliability
 * @returns GeolocationData or null if all services fail
 */
export const getGeolocationData = async (): Promise<GeolocationData | null> => {
  // Try services in order of preference
  const services = [
    fetchFromIpApi,
    fetchFromIpWhoIs,
    fetchFromIpApiCom,
    // fetchFromIpGeolocation, // Requires API key
  ];

  for (const service of services) {
    try {
      const data = await service();
      if (data && data.country && data.countryCode) {
        console.log('Geolocation data retrieved successfully:', data);
        return data;
      }
    } catch (error) {
      console.warn('Geolocation service failed:', error);
      continue;
    }
  }

  console.warn('All geolocation services failed');
  return null;
};

/**
 * Get country code from geolocation (with caching)
 */
let cachedGeolocation: GeolocationData | null = null;
let geolocationPromise: Promise<GeolocationData | null> | null = null;

export const getCachedGeolocation = async (): Promise<GeolocationData | null> => {
  // Return cached data if available
  if (cachedGeolocation) {
    return cachedGeolocation;
  }

  // Return existing promise if request is in progress
  if (geolocationPromise) {
    return geolocationPromise;
  }

  // Create new request
  geolocationPromise = getGeolocationData().then(data => {
    if (data) {
      cachedGeolocation = data;
    }
    return data;
  }).finally(() => {
    geolocationPromise = null;
  });

  return geolocationPromise;
};
