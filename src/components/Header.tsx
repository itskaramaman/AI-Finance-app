import { SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="bg-blue-200 py-4 px-6">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};

export default Header;
