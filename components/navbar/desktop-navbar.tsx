"use client";
import { Logo } from "../Logo";
import { Button } from "../button";
import { NavBarItem } from "./navbar-item";
import {
  useMotionValueEvent,
  useScroll,
  motion,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "next-view-transitions";
import { ModeToggle } from "../mode-toggle";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation"; // adjust path if needed
import { useCustomer } from '@/hooks/useAutumnCustomer';

type Props = {
  navItems: {
    link: string;
    title: string;
    target?: "_blank";
  }[];
  locale: string;
};

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

export const DesktopNavbar = ({ navItems, locale }: Props) => {
  const t = useTranslations("navbar");
  const { data: session, isPending } = useSession();
  const { scrollY } = useScroll();
  const router = useRouter();

  const [showBackground, setShowBackground] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      }, 100);
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full flex relative justify-between px-4 py-2 rounded-full bg-transparent transition duration-200",
        showBackground &&
          "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]"
      )}
    >
      <AnimatePresence>
        {showBackground && (
          <motion.div
            key={String(showBackground)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-neutral-800 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent,white)] rounded-full"
          />
        )}
      </AnimatePresence>
      <div className="flex flex-row gap-2 items-center">
        <Logo />
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => (
            <NavBarItem href={item.link} key={item.title} target={item.target}>
              {item.title}
            </NavBarItem>
          ))}
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        <ModeToggle />

        {/* Auth-aware actions */}
        {isPending ? (
          <div className="text-sm text-gray-400">{t("loading")}</div>
        ) : session ? (
          <>
            <UserCredits />
            <Button
              as={Link}
              href="/dashboard"
              variant="simple"
              className="font-medium"
            >
              {t("dashboard")}
            </Button>
            <Button
              variant="simple"
              onClick={handleLogout}
              className="font-medium"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="simple" as={Link} href="/login">
              {t("login")}
            </Button>
            <Button as={Link} href="/register">
              {t("register")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
