import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PageError({ reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <h1 className="text-3xl font-semibold">This page didn’t load</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={async () => {
            await router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
