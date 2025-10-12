"use client";

import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="mx-auto flex items-center justify-between px-8 py-4">
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
};

export default Footer;
