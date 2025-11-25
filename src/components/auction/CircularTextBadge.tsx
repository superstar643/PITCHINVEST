import React from "react";

function CircularTextBadge({
  text = "Established 2012",
  charAngleStep = 6,      // rotation difference between characters
  startAngle = 0,         // starting angle for the first character
  badgeRotation = -50,    // rotate the whole circle
  className = "",
}) {
  const chars = [...text]; // split string into characters

  return (
    <div
      className={`badge ${className} relative w-100 h-100 rounded-[50%] transform -rotate-45`}
      style={{ transform: `rotate(${badgeRotation}deg)` }}
    >
      <h1>
        {chars.map((char, index) => {
          const angle = startAngle + index * charAngleStep;

          return (
            <span
              key={index}
              style={{
                transform: `rotate(${angle}deg)`,
              }}
            >
              {char}
            </span>
          );
        })}
      </h1>
    </div>
  );
}

export default CircularTextBadge;
