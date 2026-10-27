import { SignUp } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/kronos/session";
import { SITE_PATH } from "@/lib/kronos/catalog";
import { NotConfigured } from "@/components/kronos/NotConfigured";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  if (!clerkConfigured()) return <NotConfigured />;
  return (
    <div className="flex justify-center px-6 py-16">
      <SignUp path={`${SITE_PATH}/sign-up`} routing="path" signInUrl={`${SITE_PATH}/sign-in`} fallbackRedirectUrl={`${SITE_PATH}/account`} />
    </div>
  );
}
