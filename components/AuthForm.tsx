"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signUp, signIn } from "@/lib/actions/auth.actions";
import { useState } from "react";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }

        toast.success("Account created successfully.");
        router.push("/sign-in");
      } else {
        const { email, password } = values;

        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          toast.error("An error occurred. Please try again.");
          return;
        }

        await signIn({ email, idToken });

        toast.success("Welcome back!");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px] shadow-xl transition-all hover:shadow-primary-200/10">
      <div className="flex flex-col gap-8 card py-14 px-10 bg-gradient-to-b from-dark-500 to-dark-400">
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-row gap-2 justify-center p-2 bg-dark-300 rounded-xl">
            <Image src="/logo.svg" width={38} height={32} alt="logo" />
            <h2 className="text-primary-100 text-2xl font-bold">PrepWise</h2>
          </div>
          <h1 className="text-2xl font-bold text-center">{isSignIn ? "Welcome Back" : "Create an Account"}</h1>
          <p className="text-light-200 text-center max-w-xs">
            {isSignIn 
              ? "Sign in to continue your interview practice journey" 
              : "Join PrepWise to practice job interviews with AI"}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your Email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button 
              type="submit" 
              className="btn w-full py-6 rounded-lg text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <>{isSignIn ? "Sign in" : "Create an Account"}</>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center">
          <p className="mb-3 text-light-200">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="inline-block font-bold text-primary-200 hover:text-primary-100 transition-colors px-6 py-2 border border-primary-200 rounded-lg"
          >
            {!isSignIn ? "Sign in" : "Sign up"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
