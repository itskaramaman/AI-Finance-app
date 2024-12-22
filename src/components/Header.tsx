import { SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/actions/user";

const Header = async () => {
  await checkUser();
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-10 border-b">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/">
          <Image src="/icons.png" alt="reciept-icon" height={40} width={40} />
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard size={18} />
                <span className="hidden md:block">Dashboard</span>
              </Button>
            </Link>

            <Link
              href="/transaction/create"
              className="text-gray-600 hover:text-blue-600"
            >
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:block">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
