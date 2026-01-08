import React, { useState, useMemo } from 'react';
import { GalleryCard } from '@/components/GalleryCard';
import galleryItems from '@/lib/galleryData';
import FilterBar from '@/components/FilterBar';
import { getSortedCountries } from '@/lib/countries';

const Gallery: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [statusValue, setStatusValue] = useState('all');
    const [countryValue, setCountryValue] = useState('all');
    const [tagValue, setTagValue] = useState('all');
    const [popularityValue, setPopularityValue] = useState('all');

    // Extract unique statuses from gallery items
    const statuses = useMemo(() => {
        const statusSet = new Set<string>();
        galleryItems.forEach(item => {
            if (item.availableLabel) statusSet.add(item.availableLabel);
        });
        return Array.from(statusSet).sort();
    }, []);

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
    }, []);

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
    }, [searchValue, statusValue, countryValue, tagValue, popularityValue]);

    const handleReset = () => {
        setSearchValue('');
        setStatusValue('all');
        setCountryValue('all');
        setTagValue('all');
        setPopularityValue('all');
    };

    const stats = [
        { value: '500+', label: 'ACTIVE PROJECTS' },
        { value: '$2.5B+', label: 'INVESTED' },
        { value: '1,200+', label: 'INVENTORS' },
        { value: '95%', label: 'SUCCESS RATE' },
    ];

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

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {filteredItems.map((item, index) => (
                        <GalleryCard
                            key={item.id}
                            {...item}
                            onClick={() => { }}
                        />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No results found. Try adjusting your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
