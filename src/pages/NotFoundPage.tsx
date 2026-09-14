import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-5xl font-bold text-brand-600 dark:text-brand-400">
        404
      </p>
      <h1 className="mt-3 text-xl font-semibold">This page is out of bounds</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Like an index past the end of the array, this route doesn&apos;t exist.
      </p>
      <Link to="/" className="mt-6">
        <Button>
          <Home className="h-4 w-4" />
          Back to home
        </Button>
      </Link>
    </div>
  );
}
