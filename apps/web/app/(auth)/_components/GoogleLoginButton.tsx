"use client";

import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/google/auth`, {
          method: "POST",
          body: JSON.stringify({
            access_token: credentialResponse.access_token,
          }),

          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        toast.success("Login success", {
          description: data.message,
        });

        router.replace("/feed");
      } catch (error: unknown) {
        console.error("Error:", error);
        toast.error("Google login failed!", {
          description: error instanceof Error ? error.message : "An error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error: unknown) => {
      console.error("Google login error:", error);
      toast.error("Google login failed!", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  return (
    <Button
      type="button"
      variant={"outline"}
      onClick={() => login()}
      className="w-full text-lg lg:text-xl h-12 gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
        </>
      ) : (
        <>
          <Image
            src="/google-icon.svg"
            alt="Sign in with Google"
            width={17}
            height={17}
          />
          Sign in with Google
        </>
      )}
    </Button>
  );
};

export default GoogleLoginButton;
