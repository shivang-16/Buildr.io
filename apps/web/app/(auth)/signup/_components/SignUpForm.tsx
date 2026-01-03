"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { signUpSchema } from "@/schemas/signUpSchema";
import { toast } from "sonner";
import GoogleLoginButton from "@/app/(auth)/_components/GoogleLoginButton";


const SignUp = () => {
  const [togglePassword, setTogglePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onFormSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);

    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(responseData.message || "Registration successful");
        localStorage.setItem("email", data.email);
        router.replace("/verify");
      } else {
        toast.error("Registration Failed", {
          description: responseData.message,
        });
      }
    } catch (error: unknown) {
      toast.error("Error registering user.", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-3xl font-light text-primary mb-2">Join us today</h1>
        <p className="text-2xl font-semibold text-foreground">Create your account.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 border border-border">
        {/* Google Login */}
        <GoogleLoginButton />

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-4 text-muted-foreground">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="h-12 rounded-lg"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 rounded-lg"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={togglePassword ? "text" : "password"}
                placeholder="Create a password"
                className="h-12 rounded-lg pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setTogglePassword(!togglePassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {togglePassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-full text-base font-semibold gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
