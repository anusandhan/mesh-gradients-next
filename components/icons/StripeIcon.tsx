import React from "react";

interface StripeIconProps {
  className?: string;
  size?: number;
}

const StripeIcon: React.FC<StripeIconProps> = ({
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
      <path
        d="M64 16C64 7.16344 56.8366 0 48 0H16C7.16344 0 -6.91414e-06 7.16344 -6.91414e-06 16V48C-6.91414e-06 56.8366 7.16344 64 16 64H48C56.8366 64 64 56.8366 64 48V16Z"
        fill="#635BFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.5622 24.7209C29.5622 23.178 30.7717 22.5846 32.7748 22.5846C35.6472 22.5846 39.2756 23.4945 42.148 25.1165V15.8198C39.011 14.5143 35.9118 14 32.7748 14C25.1024 14 20 18.1934 20 25.1956C20 36.1143 34.3622 34.3736 34.3622 39.0813C34.3622 40.9011 32.8504 41.4945 30.7339 41.4945C27.5969 41.4945 23.5906 40.1495 20.4157 38.3297V47.7451C23.9307 49.3275 27.4835 50 30.7339 50C38.5953 50 44 45.9253 44 38.844C43.9622 27.0549 29.5622 29.1516 29.5622 24.7209Z"
        fill="white"
      />
    </svg>
  );
};

export default StripeIcon;
