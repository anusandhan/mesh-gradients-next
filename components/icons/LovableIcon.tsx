import React from "react";

interface LovableIconProps {
  className?: string;
  size?: number;
}

const LovableIcon: React.FC<LovableIconProps> = ({
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
      <g clipPath="url(#clip0_1473_17694)">
        <mask
          id="mask0_1473_17694"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="64"
          height="64"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.0777 0C29.6139 0 38.1553 8.47481 38.1553 18.9291V26.1233H44.5043C55.0405 26.1233 63.5821 34.5981 63.5821 45.0523C63.5821 55.5064 55.0405 63.9811 44.5043 63.9811H0V18.9291C0 8.47481 8.54135 0 19.0777 0Z"
            fill="url(#paint0_linear_1473_17694)"
          />
        </mask>
        <g mask="url(#mask0_1473_17694)">
          <g filter="url(#filter0_f_1473_17694)">
            <path
              d="M27.8957 76.744C51.6661 76.744 70.9359 57.6746 70.9359 34.1513C70.9359 10.628 51.6661 -8.44141 27.8957 -8.44141C4.12523 -8.44141 -15.1445 10.628 -15.1445 34.1513C-15.1445 57.6746 4.12523 76.744 27.8957 76.744Z"
              fill="#4B73FF"
            />
          </g>
          <g filter="url(#filter1_f_1473_17694)">
            <path
              d="M32.6225 53.3709C63.0658 53.3709 87.745 34.3015 87.745 10.7782C87.745 -12.7451 63.0658 -31.8145 32.6225 -31.8145C2.17919 -31.8145 -22.5 -12.7451 -22.5 10.7782C-22.5 34.3015 2.17919 53.3709 32.6225 53.3709Z"
              fill="#FF66F4"
            />
          </g>
          <g filter="url(#filter2_f_1473_17694)">
            <path
              d="M41.6105 40.1684C65.381 40.1684 84.6507 23.4214 84.6507 2.76291C84.6507 -17.8956 65.381 -34.6426 41.6105 -34.6426C17.8401 -34.6426 -1.42969 -17.8956 -1.42969 2.76291C-1.42969 23.4214 17.8401 40.1684 41.6105 40.1684Z"
              fill="#FF0105"
            />
          </g>
          <g filter="url(#filter3_f_1473_17694)">
            <path
              d="M33.3881 36.3826C47.6836 36.3826 59.2724 24.9143 59.2724 10.7675C59.2724 -3.37938 47.6836 -14.8477 33.3881 -14.8477C19.0927 -14.8477 7.50391 -3.37938 7.50391 10.7675C7.50391 24.9143 19.0927 36.3826 33.3881 36.3826Z"
              fill="#FE7B02"
            />
          </g>
        </g>
      </g>
      <defs>
        <filter
          id="filter0_f_1473_17694"
          x="-51.5317"
          y="-44.8286"
          width="158.856"
          height="157.96"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="18.1936"
            result="effect1_foregroundBlur_1473_17694"
          />
        </filter>
        <filter
          id="filter1_f_1473_17694"
          x="-58.8872"
          y="-68.2017"
          width="183.02"
          height="157.96"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="18.1936"
            result="effect1_foregroundBlur_1473_17694"
          />
        </filter>
        <filter
          id="filter2_f_1473_17694"
          x="-37.8169"
          y="-71.0298"
          width="158.856"
          height="147.585"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="18.1936"
            result="effect1_foregroundBlur_1473_17694"
          />
        </filter>
        <filter
          id="filter3_f_1473_17694"
          x="-28.8833"
          y="-51.2349"
          width="124.544"
          height="124.005"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="18.1936"
            result="effect1_foregroundBlur_1473_17694"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1473_17694"
          x1="21.3965"
          y1="11.2436"
          x2="40.4128"
          y2="64.0852"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.025" stopColor="#FF8E63" />
          <stop offset="0.56" stopColor="#FF7EB0" />
          <stop offset="0.95" stopColor="#4B73FF" />
        </linearGradient>
        <clipPath id="clip0_1473_17694">
          <rect width="64" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LovableIcon;
