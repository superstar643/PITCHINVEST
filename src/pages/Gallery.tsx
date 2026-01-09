import React, { useState, useMemo, useEffect } from 'react';
import { GalleryCard } from '@/components/GalleryCard';
import FilterBar from '@/components/FilterBar';
import { getSortedCountries } from '@/lib/countries';
import { fetchGalleryItems, type GalleryItem as DBGalleryItem } from '@/lib/projects';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface GalleryItem {
    id: string | number;
    title: string;
    artist: string;
    subtitle?: string;
    imageUrl: string;
    category?: string;
    views: number;
    availableStatus: boolean;
    availableLabel?: string;
    badges?: string[];
    likes: number;
    author?: {
        name: string;
        avatarUrl?: string;
        country?: string;
        verified?: boolean;
    };
    actions?: string[];
    date?: string;
    description?: string;
    location?: string;
}

const Gallery: React.FC = () => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [statusValue, setStatusValue] = useState('all');
    const [countryValue, setCountryValue] = useState('all');
    const [tagValue, setTagValue] = useState('all');
    const [popularityValue, setPopularityValue] = useState('all');

    // Fetch gallery items from Supabase
    useEffect(() => {
        const loadGalleryItems = async () => {
            try {
                setLoading(true);
                const data = await fetchGalleryItems({
                    limit: 1000, // Fetch all gallery items
                });
                
                // Convert DB gallery items to UI gallery items format
                const convertedItems: GalleryItem[] = data.map((item) => {
                    // Determine badges
                    const badges: string[] = [];
                    if (item.featured) badges.push('FEATURED');
                    if (item.author_verified) badges.push('VALIDATED');
                    if ((item.likes || 0) > 100 || (item.views || 0) > 10000) {
                        badges.push('TRENDING');
                    }
                    if (item.badges && item.badges.length > 0) {
                        badges.push(...item.badges);
                    }

                    return {
                        id: item.id,
                        title: item.title,
                        artist: item.artist || item.author_name || 'Unknown',
                        subtitle: item.subtitle,
                        imageUrl: item.image_url || item.images?.[0] || '/placeholder.svg',
                        category: item.category,
                        views: item.views || 0,
                        availableStatus: item.available_status ?? true,
                        availableLabel: item.available_label || (item.available_status ? 'Available' : 'Unavailable'),
                        badges: badges.length > 0 ? badges : undefined,
                        likes: item.likes || 0,
                        author: item.author_name ? {
                            name: item.author_name,
                            avatarUrl: item.author_avatar_url || undefined,
                            country: item.author_country || undefined,
                            verified: item.author_verified || false,
                        } : undefined,
                        actions: item.actions && item.actions.length > 0 ? item.actions : undefined,
                        date: item.date,
                        description: item.description,
                        location: item.location || item.author_country,
                    };
                });
                
                setGalleryItems(convertedItems);
            } catch (error) {
                console.error('Error loading gallery items:', error);
            } finally {
                setLoading(false);
            }
        };

        loadGalleryItems();
    }, []);

    // Extract unique statuses from gallery items
    const statuses = useMemo(() => {
        const statusSet = new Set<string>();
        galleryItems.forEach(item => {
            if (item.availableLabel) statusSet.add(item.availableLabel);
        });
        return Array.from(statusSet).sort();
    }, [galleryItems]);

    // Use comprehensive countries list from countries.ts (all countries worldwide)
    const allCountries = useMemo(() => {
        return getSortedCountries().map(country => country.name);
    }, []);

    // Extract unique tags/badges from gallery items
    const tags = useMemo(() => {
        const tagSet = new Set<string>();
        galleryItems.forEach(item => {
            if (item.badges && item.badges.length > 0) {
                item.badges.forEach(badge => tagSet.add(badge));
            }
        });
        return Array.from(tagSet).sort();
    }, [galleryItems]);

    // Popularity options based on likes/views
    const popularityOptions = [
        'Most Popular',
        'High Engagement',
        'Moderate Engagement',
        'Low Engagement'
    ];

    // Filter gallery items based on all filters
    const filteredItems = useMemo(() => {
        return galleryItems.filter(item => {
            // Search filter
            const matchesSearch = searchValue === '' || 
                item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.artist.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchValue.toLowerCase());

            // Status filter (Available/Unavailable)
            const matchesStatus = statusValue === 'all' || 
                item.availableLabel === statusValue;

            // Country filter
            const matchesCountry = countryValue === 'all' || 
                item.location === countryValue ||
                item.author?.country === countryValue;

            // Tags filter (badges like FEATURED, TRENDING, VALIDATED)
            const matchesTag = tagValue === 'all' || 
                (item.badges && item.badges.includes(tagValue));

            // Popularity filter based on likes and views
            let matchesPopularity = true;
            if (popularityValue !== 'all') {
                const likes = item.likes || 0;
                const views = item.views || 0;
                const engagementScore = likes * 10 + views; // Weighted engagement score
                
                switch (popularityValue) {
                    case 'Most Popular':
                        // Top 20% by engagement score
                        matchesPopularity = engagementScore >= 100000;
                        break;
                    case 'High Engagement':
                        matchesPopularity = engagementScore >= 50000 && engagementScore < 100000;
                        break;
                    case 'Moderate Engagement':
                        matchesPopularity = engagementScore >= 20000 && engagementScore < 50000;
                        break;
                    case 'Low Engagement':
                        matchesPopularity = engagementScore < 20000;
                        break;
                }
            }

            return matchesSearch && matchesStatus && matchesCountry && matchesTag && matchesPopularity;
        });
    }, [galleryItems, searchValue, statusValue, countryValue, tagValue, popularityValue]);

    const handleReset = () => {
        setSearchValue('');
        setStatusValue('all');
        setCountryValue('all');
        setTagValue('all');
        setPopularityValue('all');
    };

    // Calculate real stats from gallery items
    const stats = useMemo(() => {
        const activeProjects = galleryItems.filter(item => item.availableStatus).length;
        const totalProjects = galleryItems.length;
        const totalViews = galleryItems.reduce((sum, item) => sum + (item.views || 0), 0);
        const totalLikes = galleryItems.reduce((sum, item) => sum + (item.likes || 0), 0);
        
        // Format numbers nicely
        const formatNumber = (num: number): string => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
            return `${num}+`;
        };
        
        return [
            { value: activeProjects > 0 ? `${activeProjects}+` : '0', label: 'ACTIVE PROJECTS' },
            { value: totalViews > 0 ? formatNumber(totalViews) : '0', label: 'TOTAL VIEWS' },
            { value: totalProjects > 0 ? `${totalProjects}+` : '0', label: 'TOTAL PROJECTS' },
            { value: totalLikes > 0 ? formatNumber(totalLikes) : '0', label: 'TOTAL LIKES' },
        ];
    }, [galleryItems]);

    return (
        <div className="min-h-screen bg-white pt-24 flex flex-col items-center mb-12">
            {/* Hero Stats Section */}
            <div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="text-[#0a3d5c]">Discover </span>
                        <span className="text-[#d5b775]">Revolutionary Innovations</span>
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        Connect with brilliant inventors and invest in groundbreaking technologies that are shaping the future. From medical breakthroughs to sustainable energy solutions.
                    </p>
                </div>
                
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-2xl py-6 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="text-2xl md:text-3xl font-bold text-[#d5b775] mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs md:text-sm font-semibold text-gray-500 tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-7xl 2xl:mx-40 lg:mx-30 md:mx-10 sm:mx-10 xs:mx-10 px-4">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    statusValue={statusValue}
                    onStatusChange={setStatusValue}
                    countryValue={countryValue}
                    onCountryChange={setCountryValue}
                    tagValue={tagValue}
                    onTagChange={setTagValue}
                    popularityValue={popularityValue}
                    onPopularityChange={setPopularityValue}
                    onReset={handleReset}
                    statuses={statuses}
                    countries={allCountries}
                    tags={tags}
                    popularities={popularityOptions}
                    searchPlaceholder="Search projects, innovations..."
                />

                {loading ? (
                    <div className="py-12">
                        <LoadingSpinner message="Loading projects..." />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {filteredItems.map((item) => (
                                <GalleryCard
                                    key={item.id}
                                    {...item}
                                    onClick={() => { }}
                                />
                            ))}
                        </div>

                        {filteredItems.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                {galleryItems.length === 0 
                                    ? 'No projects available yet. Check back soon!'
                                    : 'No results found. Try adjusting your filters.'}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Gallery;
