"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin page with a query parameter to show signup form
    router.push("/auth/signin?mode=signup");
  }, [router]);

  return null;
}
