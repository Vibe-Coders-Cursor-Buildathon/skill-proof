import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo } = await searchParams;
  const params = new URLSearchParams({ auth: "signin" });
  if (redirectTo) {
    params.set("redirect", redirectTo);
  }
  redirect(`/?${params.toString()}`);
}
