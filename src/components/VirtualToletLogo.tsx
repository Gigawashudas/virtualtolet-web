import Link from "next/link";

type VirtualToletLogoProps = {
  href?: string;
  className?: string;
  showTagline?: boolean;
};

export default function VirtualToletLogo({ href = "/", className = "", showTagline = false }: VirtualToletLogoProps) {
  return (
    <Link href={href} aria-label="Virtual To-let" className={`inline-flex items-center gap-3 ${className}`}>
      {/* New house and location-pin logo */}
      <svg width="46" height="46" viewBox="0 0 360 410" xmlns="http://www.w3.org/2000/svg" className="h-[46px] w-[46px] shrink-0" role="img" aria-label="Virtual To-let logo">
        <path d="M40 175 L180 55 L320 175" fill="none" stroke="#006B4F" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M82 164V290Q82 315 107 315H253Q278 315 278 290V164" fill="#006B4F" />

        <path d="M122 175V290H238V175L180 125Z" fill="#FFFFFF" />

        <g fill="#20252B">
          <rect x="155" y="145" width="22" height="22" rx="2" />
          <rect x="183" y="145" width="22" height="22" rx="2" />
          <rect x="155" y="173" width="22" height="22" rx="2" />
          <rect x="183" y="173" width="22" height="22" rx="2" />
        </g>

        <path d="M180 218C139 218 113 246 113 282C113 330 180 385 180 385C180 385 247 330 247 282C247 246 221 218 180 218Z" fill="#F5222D" />

        <circle cx="180" cy="280" r="25" fill="#FFFFFF" />
      </svg>

      {/* Wordmark and optional tagline */}
      <span className="flex flex-col">
        <span className="whitespace-nowrap font-[Manrope,sans-serif] text-[30px] font-extrabold leading-none tracking-[-1.5px] text-black">
          <span className="text-[#20252B]">Virtual</span> <span className="text-[#006B4F]">To-let</span>
        </span>

        {showTagline && <span className="mt-1 whitespace-nowrap text-[8px] font-medium tracking-[1.5px] text-[#20252B]">FIND IT. LIST IT. RENT IT.</span>}
      </span>
    </Link>
  );
}
