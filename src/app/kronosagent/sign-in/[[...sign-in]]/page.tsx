import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/kronos/session";
import { SITE_PATH } from "@/lib/kronos/catalog";
import { NotConfigured } from "@/components/kronos/NotConfigured";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  if (!clerkConfigured()) return <NotConfigured />;
  return (
    <div className="flex justify-center px-6 py-16">
      <SignIn path={`${SITE_PATH}/sign-in`} routing="path" signUpUrl={`${SITE_PATH}/sign-up`} fallbackRedirectUrl={`${SITE_PATH}/account`} />
    </div>
  );
}
