import React, { useState, useMemo } from 'react';
import { GalleryCard } from '@/components/GalleryCard';
import galleryItems from '@/lib/galleryData';
import FilterBar from '@/components/FilterBar';

const Gallery: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [countryValue, setCountryValue] = useState('all');

    // Extract unique countries from gallery items
    const countries = useMemo(() => {
        const countrySet = new Set<string>();
        galleryItems.forEach(item => {
            if (item.location) countrySet.add(item.location);
            if (item.author?.country) countrySet.add(item.author.country);
        });
        return Array.from(countrySet).sort();
    }, []);

    // Filter gallery items based on search and country
    const filteredItems = useMemo(() => {
        return galleryItems.filter(item => {
            // Search filter
            const matchesSearch = searchValue === '' || 
                item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.artist.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchValue.toLowerCase());

            // Country filter
            const matchesCountry = countryValue === 'all' || 
                item.location === countryValue ||
                item.author?.country === countryValue;

            return matchesSearch && matchesCountry;
        });
    }, [searchValue, countryValue]);

    const handleReset = () => {
        setSearchValue('');
        setCountryValue('all');
    };

    return (
        <div className="min-h-screen bg-white pt-24 flex justify-center mb-12">
            <div className="w-full max-w-7xl 2xl:mx-40 lg:mx-30 md:mx-10 sm:mx-10 xs:mx-10">
                <h1 className="text-4xl font-bold text-[#0a3d5c] mb-10 text-center">Gallery</h1>
                
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    countryValue={countryValue}
                    onCountryChange={setCountryValue}
                    onReset={handleReset}
                    countries={countries}
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
