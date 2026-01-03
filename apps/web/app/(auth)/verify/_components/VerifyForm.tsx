"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";


const Verify = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6) as any;
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const onOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setIsVerifying(true);
    const email = localStorage.getItem("email");

    if (!email) {
       toast.error("Email not found. Please register again.");
       router.replace("/signup");
       return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otpValue,
          email,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Account verified successfully", {
          description: responseData.message,
        });
        localStorage.removeItem("email");
        router.replace("/feed");
      } else {
        toast.error(responseData.message || "Verification failed");
      }
    } catch (error: any) {
      toast.error("Account verification failed!", {
        description: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      toast.error("Email not found. Please register again.");
      router.replace("/signup");
      return;
    }

    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast.error("Failed to resend OTP", {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Logo */}
      <div className="mb-8">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 dark:fill-white fill-black">
          <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </g>
        </svg>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-primary mb-2">Verify your email</h1>
        <p className="text-lg text-muted-foreground">Enter the code we sent to your email</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 border border-border">
        <form onSubmit={onOTPSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-semibold rounded-lg"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-full text-base font-semibold gap-2"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-primary font-medium hover:underline"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
