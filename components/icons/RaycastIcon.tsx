import React from "react";

interface RaycastIconProps {
  className?: string;
  size?: number;
}

const RaycastIcon: React.FC<RaycastIconProps> = ({
  className = "",
  size = 16,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_1473_17711)">
        <path
          d="M16 41.28V48L0 32L3.36 28.64L16 41.28ZM22.72 48H16L32 64L35.36 60.64L22.72 48ZM60.64 35.36L64 32L32 0L28.64 3.36L41.28 16H33.6L24.8 7.2L21.44 10.56L26.88 16H23.04V40.8H48V36.96L53.44 42.4L56.8 39.04L48 30.4V22.72L60.64 35.36ZM17.6 14.4L14.4 17.76L17.92 21.28L21.28 17.92L17.6 14.4ZM46.08 42.72L42.72 46.08L46.24 49.6L49.6 46.4L46.08 42.72ZM10.56 21.44L7.2 24.8L16 33.6V26.88L10.56 21.44ZM36.96 48H30.4L39.2 56.8L42.56 53.44L36.96 48Z"
          fill="#FF6161"
        />
      </g>
      <defs>
        <clipPath id="clip0_1473_17711">
          <rect width="64" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RaycastIcon;
