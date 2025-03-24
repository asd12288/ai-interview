import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.actions";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  const user = await getCurrentUser();

  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="shadow-sm bg-dark-500">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex justify-between items-center">
            <Link href={"/"} className="flex items-center gap-2">
              <Image src={"/logo.svg"} alt="logo" width={38} height={32} />
              <h2 className="text-primary-100 text-xl font-bold">PrepWise</h2>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/" className="text-light-100 hover:text-primary-100 transition">
                Dashboard
              </Link>
              <div className="flex items-center gap-2 bg-dark-400 rounded-full py-1 px-3">
                <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-dark-500 font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-light-100 text-sm hidden sm:block">{user?.name || 'User'}</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-dark-500 py-6 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src={"/logo.svg"} alt="logo" width={28} height={24} />
              <p className="text-primary-100">PrepWise © {new Date().getFullYear()}</p>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-light-100 hover:text-primary-100 transition">About</Link>
              <Link href="#" className="text-light-100 hover:text-primary-100 transition">Privacy</Link>
              <Link href="#" className="text-light-100 hover:text-primary-100 transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
