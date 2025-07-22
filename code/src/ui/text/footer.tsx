import Link from "next/link";
import Image from "next/image";

import { Assets } from "io/config/assets";

/**
 * Renders a footer.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-foreground bg-muted flex w-full items-center justify-center">
      <Image
        alt={"TWA Logo"}
        src={Assets.TWA}
        width={30}
        height={30}
        className="pr-1"
      />
      <span>
        Powered by&nbsp;
        <Link
          className="text-links hover:text-links-hover"
          href="https://theworldavatar.io"
        >
          The World Avatar&#8482;
        </Link>
        &nbsp;{currentYear}
      </span>
    </footer>
  );
}
