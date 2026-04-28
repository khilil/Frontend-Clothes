import React from 'react';

const SkeletonCards = ({ count = 8, gridClass = "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" }) => {
    return (
        <div className={`w-full ${gridClass}`}>
            {Array(count).fill(0).map((_, index) => (
                <div key={index} className="luxury-card group h-full bg-white overflow-hidden rounded-[24px] border border-neutral-100 flex flex-col">
                    {/* Image Aspect Box Skeleton */}
                    <div className="relative aspect-[4/5] md:aspect-[3/3.8] bg-neutral-50 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f0f0f0_25%,#f8f8f8_50%,#f0f0f0_75%)] bg-[length:200%_100%] animate-[loading-shimmer_2s_infinite]"></div>
                    </div>
                    
                    {/* Info Section Skeleton */}
                    <div className="p-3.5 md:p-6 bg-white grow flex flex-col gap-2 md:gap-4 border-t border-neutral-100">
                        <div className="flex flex-col gap-2">
                             {/* Brand Skeleton */}
                            <div className="bg-neutral-100 h-2 w-[30%] rounded animate-pulse"></div>
                             {/* Title Skeleton */}
                            <div className="bg-neutral-200 h-4 w-[80%] rounded animate-pulse"></div>
                             {/* Price Skeleton */}
                            <div className="bg-neutral-200 h-5 w-[40%] rounded animate-pulse mt-1"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonCards;
