import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NavBar() {
  return (
    <div className="flex items-center justify-between p-4 text-white border-b-4 border-chart-1 rounded-2xl">
      <Link href="/">
        <h1 className="text-chart-1 font-bold text-xl ">Team Flow</h1>
      </Link>
      <div className="flex space-x-2">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}
