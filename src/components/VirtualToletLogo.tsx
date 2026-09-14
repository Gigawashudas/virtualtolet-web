import Link from "next/link";

type VirtualToletLogoProps = {
  href?: string;
  className?: string;
};

export default function VirtualToletLogo({ href = "/", className = "" }: VirtualToletLogoProps) {
  return (
    <Link href={href} aria-label="Virtual To-let" className={`group inline-flex items-center ${className}`}>
      <svg viewBox="0 0 250 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-[190px] sm:w-[205px]" role="img" aria-labelledby="virtualtolet-logo-title">
        <title id="virtualtolet-logo-title">Virtual To-let</title>

        {/* V */}
        <path d="M4 6L19 40L34 6" stroke="#006A4E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* T — same height as V */}
        <path d="M9 6H29" stroke="#F42A41" strokeWidth="6" strokeLinecap="round" />

        <path d="M19 6V40" stroke="#F42A41" strokeWidth="6" strokeLinecap="round" />

        {/* Wordmark */}
        <text x="47" y="35" fill="#006A4E" fontFamily="Manrope, sans-serif" fontSize="30" fontWeight="800" letterSpacing="-1.5">
          Virtual
        </text>

        <text x="140" y="35" fill="#F42A41" fontFamily="Manrope, sans-serif" fontSize="30" fontWeight="800" letterSpacing="-1.5">
          {" "}
          To-let{" "}
        </text>
      </svg>
    </Link>
  );
}
