import React from 'react';
import { GalleryCard } from '@/components/GalleryCard';
import galleryItems from '@/lib/galleryData';


const Gallery: React.FC = () => {
    return (
        <div className="min-h-screen bg-white pt-24 flex justify-center mb-12">
            <div className="w-full max-w-7xl 2xl:mx-40 lg:mx-30 md:mx-10 sm:mx-10 xs:mx-10">
                <h1 className="text-4xl font-bold text-[#0a3d5c] mb-10 text-center">Gallery</h1>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {galleryItems.map((item, index) => (
                        <GalleryCard
                            key={item.id}
                            {...item}
                            onClick={() => { }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
