import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const content = [
    {
      title: "Latest Arrivals",
      subtitle: "OUR BESTSELLERS",
      buttonText: "SHOP NOW",
      image: assets.hero_img,
    },
    {
      title: "Trending Now",
      subtitle: "HOT ITEMS",
      buttonText: "SHOP NOW",
      image: assets.hero_img3,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % content.length);
    }, 4000); // Switch every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
        }}
      >
        {content.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row w-full min-w-full border border-gray-400"
          >
            {/* Hero Left Side */}
            <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
              <div className="text-[#414141]">
                <div className="flex items-center gap-2">
                  <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
                  <p className="font-medium text-sm md:text-base">{item.subtitle}</p>
                </div>
                <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
                  {item.title}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm md:text-base">{item.buttonText}</p>
                  <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
                </div>
              </div>
            </div>

            {/* Hero Right Side */}
            <div className="w-full sm:w-1/2">
              <img
                src={item.image}
                className="h-[500px] object-cover"
                alt={`Hero ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
