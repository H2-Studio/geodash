"use client";
import { cn } from "@/lib/utils";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import { Button } from "../button";
import { Logo } from "../Logo";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ModeToggle } from "../mode-toggle";
import { useSession, signOut } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useCustomer } from "@/hooks/useAutumnCustomer";


function UserCredits() {
  const { customer } = useCustomer();
  const t = useTranslations('navbar');
  const messageUsage =
    customer?.features?.messages ??
    customer?.features?.['pro-messages'] ??
    customer?.features?.['free-messages'];
  const remainingMessages = messageUsage ? (messageUsage.balance || 0) : 0;
  return (
    <div className="flex items-center text-sm font-medium text-gray-700">
      <span>{remainingMessages}</span>
      <span className="ml-1">{t('credits')}</span>
    </div>
  );
}


export const MobileNavbar = ({ navItems, locale }: any) => {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const [showBackground, setShowBackground] = useState(false);

  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations("navbar");
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (value) => {
    setShowBackground(value > 100);
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setTimeout(() => {
        router.refresh();
        setIsLoggingOut(false);
        setOpen(false);
      }, 100);
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={cn(
        "flex justify-between bg-white dark:bg-neutral-900 items-center w-full rounded-full px-2.5 py-1.5 transition duration-200",
        showBackground &&
          "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]"
      )}
    >
      <Logo />
      <IoIosMenu
        className="text-black dark:text-white h-6 w-6"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col items-start justify-start space-y-10 pt-5 text-xl text-zinc-600 transition duration-200 hover:text-zinc-800">
          <div className="flex items-center justify-between w-full px-5">
            <Logo />
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <IoIosClose
                className="h-8 w-8 text-black dark:text-white"
                onClick={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-[14px] px-8">
            {navItems.map((navItem: any, idx: number) => (
              <div key={idx}>
                {navItem.children && navItem.children.length > 0 ? (
                  navItem.children.map((childNavItem: any, cidx: number) => (
                    <Link
                      key={`child-link=${cidx}`}
                      href={childNavItem.link}
                      onClick={() => setOpen(false)}
                      className="relative max-w-[15rem] text-left text-2xl"
                    >
                      <span className="block text-black">
                        {childNavItem.title}
                      </span>
                    </Link>
                  ))
                ) : (
                  <Link
                    key={`link=${idx}`}
                    href={navItem.link}
                    onClick={() => setOpen(false)}
                    className="relative"
                  >
                    <span className="block text-[26px] text-black dark:text-white">
                      {navItem.title}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          { session  &&
          <div className="w-full px-4 py-4">
            <UserCredits />
          </div>}
          <div className="flex flex-row w-full items-start gap-2.5 px-4 py-4">
            {/* Auth-aware actions */}
            {isPending ? (
              <div className="text-sm text-gray-400">{t("loading")}</div>
            ) : session ? (
              <>
                <Button
                  as={Link}
                  href="/dashboard"
                  variant="simple"
                  className="font-medium"
                  onClick={() => setOpen(false)}
                >
                  {t("dashboard")}
                </Button>
                <Button
                  onClick={handleLogout}
                  className="font-medium"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? t("loggingOut") : t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} href="/register">
                  {t("register")}
                </Button>
                <Button variant="simple" as={Link} href="/login">
                  {t("login")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
