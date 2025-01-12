"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  Moon,
  Sun,
  UserIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";

const MobileNavbar = () => {
  const { theme, setTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <div className="md:hidden flex items-center space-x-2">
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant={"ghost"} size={"icon"}>
            <MenuIcon className="w-5 h-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side={"right"} className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col space-y-4 mt-6">
            <Button
              variant={"ghost"}
              asChild
              className="flex items-center gap-3 justify-start"
            >
              <Link href="/">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button
                  variant={"ghost"}
                  className="flex items-center justify-start gap-3"
                  asChild
                >
                  <Link href="/notifications">
                    <BellIcon className="w-4 h-4" />
                    Notifications
                  </Link>
                </Button>

                <Button
                  variant={"ghost"}
                  className="flex items-center justify-start gap-3"
                  asChild
                >
                  <Link href={"/profile"}>
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                </Button>

                <SignOutButton>
                  <Button
                    variant={"ghost"}
                    className="flex items-center justify-start gap-3"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant={"default"}
                    className="flex items-center justify-start gap-3"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavbar;
