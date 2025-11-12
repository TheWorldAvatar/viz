import Link from "next/link";
import Image from "next/image";

import { Assets } from "io/config/assets";

/**
 * Renders a footer.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="sticky bottom-0 left-0 text-foreground flex items-center justify-center p-1 z-[999]">
      <div className="flex items-center gap-1">
        <Image
          alt={"TWA Logo"}
          src={Assets.TWA}
          width={30}
          height={30}
          className="pr-1"
        />
        <span>
          Powered by&nbsp;iris
          <Link
            className="text-links hover:text-links-hover"
            href="https://theworldavatar.io"
          >
            The World Avatar&#8482;
          </Link>
          &nbsp;{currentYear}
        </span>
      </div>
    </footer>
  );
}
