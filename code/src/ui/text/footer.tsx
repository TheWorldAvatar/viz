import styles from "./footer.module.css";
import Link from "next/link";
import Image from "next/image";

import { Assets } from "io/config/assets";

/**
 * Renders a footer.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-200 flex justify-center items-center h-14 border-t border-t-gray-400 text-black">
      <Image
        alt={"TWA Logo"}
        src={Assets.TWA}
        width={30}
        height={30}
        style={{ paddingRight: 5 }}
      />
      <span>
        Powered by&nbsp;
        <Link href="https://theworldavatar.io">The World Avatar&#8482;</Link>
        &nbsp;{currentYear}
      </span>
    </footer>
  );
}
