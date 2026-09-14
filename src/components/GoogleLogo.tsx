type GoogleLogoProps = {
  className?: string;
};

export default function GoogleLogo({ className = "h-5 w-5" }: GoogleLogoProps) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.84-6.84C35.9 2.42 30.47 0 24 0 14.61 0 6.51 5.38 2.56 13.22l7.96 6.18C12.43 13.03 17.74 9.5 24 9.5z" />

      <path fill="#4285F4" d="M46.5 24.55c0-1.64-.15-3.22-.44-4.74H24v9.48h12.63c-.54 2.88-2.16 5.32-4.6 6.96l7.48 5.81C43.89 37.91 46.5 31.86 46.5 24.55z" />

      <path fill="#FBBC05" d="M10.52 28.6A14.4 14.4 0 0 1 9.5 24c0-1.6.28-3.15.78-4.6l-7.96-6.18A24.05 24.05 0 0 0 0 24c0 3.89.93 7.59 2.56 10.78l7.96-6.18z" />

      <path fill="#34A853" d="M24 48c6.48 0 11.92-2.14 15.89-5.94l-7.48-5.81c-2.08 1.39-4.74 2.21-8.41 2.21-6.26 0-11.57-3.53-13.48-9.9l-7.96 6.18C6.51 42.62 14.61 48 24 48z" />
    </svg>
  );
}
