interface ExternalPageProps {
  url: string;
  title: string;
}

/**
 * Renders an external web application in a full height iframe.
 * The external application must permit framing by this origin via its `Content-Security-Policy: frame-ancestors` header.
 *
 * @param {string} url The URL of the external application.
 * @param {string} title An accessible title for the iframe.
 */
export default function ExternalPage(props: Readonly<ExternalPageProps>) {
  return (
    <iframe
      className="h-full w-full border-0"
      src={props.url}
      title={props.title}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
      allow="clipboard-read; clipboard-write; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
