import Link from "next/link";

type VirtualToletLogoProps = {
  href?: string;
  className?: string;
};

export default function VirtualToletLogo({ href = "/", className = "" }: VirtualToletLogoProps) {
  return (
    <Link href={href} aria-label="Virtual To-let" className={`inline-flex items-center gap-3 ${className}`}>
      {/* Logo mark */}
      <svg width="46" height="46" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
        <circle cx="26" cy="26" r="22" stroke="#006A4E" strokeWidth="4" />

        <path d="M11 31C15 41 26 45 36 39C44 34 47 24 42 15" stroke="#F42A41" strokeWidth="4" strokeLinecap="round" />

        <circle cx="26" cy="26" r="6" fill="#006A4E" />

        <circle cx="26" cy="26" r="2.5" fill="#F42A41" />
      </svg>

      {/* Wordmark */}
      <span className="flex items-center whitespace-nowrap font-[Manrope,sans-serif] text-[30px] font-extrabold leading-none tracking-[-1.5px] text-black">Virtual To-let</span>
    </Link>
  );
}
