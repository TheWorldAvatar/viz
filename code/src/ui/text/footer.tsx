import Link from "next/link";
import Image from "next/image";

import { Assets } from "io/config/assets";

/**
 * Renders a footer.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="absolute left-1 bottom-1 w-full bg-transparent flex justify-center items-center text-foreground">
      <Image
        alt={"TWA Logo"}
        src={Assets.TWA}
        width={30}
        height={30}
        className="pr-1"
      />
      <span>
        Powered by&nbsp;
        <Link href="https://theworldavatar.io">The World Avatar&#8482;</Link>
        &nbsp;{currentYear}
      </span>
    </footer>
  );
}
