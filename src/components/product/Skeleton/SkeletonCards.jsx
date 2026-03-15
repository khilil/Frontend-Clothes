import React from 'react';
const SkeletonCards = ({ count = 8 }) => {
    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[15px] md:gap-[30px]">
            {Array(count).fill(0).map((_, index) => (
                <div key={index} className="relative h-[320px] md:h-[450px] bg-white/5 rounded-2xl overflow-hidden">
                    <div className="h-[75%] bg-[linear-gradient(90deg,#1a1a1a_25%,#2a2a2a_50%,#1a1a1a_75%)] bg-[length:200%_100%] animate-[loading-shimmer_1.5s_infinite]"></div>
                    <div className="p-5 flex flex-col gap-2.5">
                        <div className="bg-[linear-gradient(90deg,#1a1a1a_25%,#2a2a2a_50%,#1a1a1a_75%)] bg-[length:200%_100%] animate-[loading-shimmer_1.5s_infinite] rounded h-4 w-[80%]"></div>
                        <div className="bg-[linear-gradient(90deg,#1a1a1a_25%,#2a2a2a_50%,#1a1a1a_75%)] bg-[length:200%_100%] animate-[loading-shimmer_1.5s_infinite] rounded h-3 w-[40%]"></div>
                        <div className="bg-[linear-gradient(90deg,#1a1a1a_25%,#2a2a2a_50%,#1a1a1a_75%)] bg-[length:200%_100%] animate-[loading-shimmer_1.5s_infinite] rounded h-[14px] w-[30%]"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonCards;
