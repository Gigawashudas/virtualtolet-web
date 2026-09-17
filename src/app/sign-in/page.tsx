import SignInForm from "./SignInForm";

type SignInPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  const redirectTo = typeof params.redirect === "string" && params.redirect.startsWith("/") ? params.redirect : "/";

  return <SignInForm redirectTo={redirectTo} />;
}
