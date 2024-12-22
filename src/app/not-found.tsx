import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center pt-20 gap-5">
      <h1 className="text-3xl gradient-title">Page Not Found</h1>
      <p>Oops; the page you are looking for does not exists</p>

      <Button variant="bgBlue" asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
