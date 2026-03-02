import React from 'react';
import './SkeletonCards.css';

const SkeletonCards = ({ count = 8 }) => {
    return (
        <div className="skeleton-grid">
            {Array(count).fill(0).map((_, index) => (
                <div key={index} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-info">
                        <div className="skeleton-line title"></div>
                        <div className="skeleton-line brand"></div>
                        <div className="skeleton-line price"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonCards;
