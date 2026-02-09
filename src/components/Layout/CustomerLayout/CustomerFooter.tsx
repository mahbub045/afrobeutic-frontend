import Link from "next/link";

export default function CustomerFooter() {
  return (
    <footer>
      <div className="mx-auto flex flex-col items-center justify-end gap-10 px-8 py-4 md:flex-row">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Afrobeutic. All rights reserved.
        </p>
        <div className="text-muted-foreground text-xs">
          <Link href="/privacy" className="mr-4 hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
