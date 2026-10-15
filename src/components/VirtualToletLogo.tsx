import Link from "next/link";

type VirtualToletLogoProps = {
  href?: string;
  className?: string;
};

export default function VirtualToletLogo({ href = "/", className = "" }: VirtualToletLogoProps) {
  return (
    <Link href={href} aria-label="Virtual To-let" className={`group inline-flex items-center gap-3 ${className}`}>
      {/* Refined circular location mark */}
      <svg width="46" height="46" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
        {/* Outer location ring */}
        <circle cx="26" cy="26" r="22" stroke="#006B4F" strokeWidth="3.5" />

        {/* Location route */}
        <path d="M12 30C15 39 24 44 33 41C41 38 46 30 44 21" stroke="#F5222D" strokeWidth="3.5" strokeLinecap="round" />

        {/* Central location point */}
        <circle cx="26" cy="26" r="7" fill="#006B4F" />

        <circle cx="26" cy="26" r="3" fill="#FFFFFF" />

        {/* Small route endpoint */}
        <circle cx="44" cy="21" r="2.5" fill="#F5222D" />
      </svg>

      {/* Wordmark */}
      <span className="whitespace-nowrap font-[Manrope,sans-serif] text-[30px] font-extrabold leading-none tracking-[-1.5px] text-[#20252B]">
        <span>Virtual</span> <span className="text-[#006B4F]">To-let</span>
      </span>
    </Link>
  );
}
