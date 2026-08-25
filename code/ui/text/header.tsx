import type { LucideIcon } from "lucide-react";
import IconComponent from "@/ui/graphic/icon/icon";
import LoadingSpinner from "@/ui/graphic/loader/spinner";

interface HeaderFieldProps {
  name: string;
  icon: LucideIcon | string;
  containerStyle: string;
  headerNameStyle: string;
  isLoading: boolean;
  spacing?: string;
  toggleExpansion: () => void;
}

/**
 * This component renders a header field.
 *
 * @param {string} name Header name displayed.
 * @param {LucideIcon | string} icon The icon to display: a lucide component, or an image path (e.g. Assets.SUBQUERY).
 * @param {string} containerStyle Styling for the container.
 * @param {string} headerNameStyle Styling for the header name.
 * @param {boolean} isLoading  Indicates if a loading indicator is required.
 * @param {string} spacing Optional spacing value.
 * @param {Function} toggleExpansion Function to toggle expansion on click.
 */
export default function HeaderField(props: Readonly<HeaderFieldProps>) {
  return (
    <div
      style={{ paddingLeft: props.spacing }}
      className={props.containerStyle}
      onClick={props.toggleExpansion}
    >
      {!props.isLoading && (
        <IconComponent icon={props.icon} classes="size-4 shrink-0" />
      )}

      {/* Renders a loading indicator when required, or else, shows the required icon */}
      {props.isLoading && (
        <div className="w-4">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {/* Header Name */}
      <div className={props.headerNameStyle}>{props.name}</div>
    </div>
  );
}
