import { Icon } from '@mui/material';
import Image from 'next/image';

interface IconComponentProps {
  readonly icon: string;
  readonly classes?: string
  readonly height?: number
  readonly width?: number
}

/**
 * Reusable component for displaying icons. It supports PNG, JPG, SVG, and Google Material icons.
 * 
 * @param {string} icon The icon to display. It can be a URL to an image (PNG, JPG), the name of a Material icon, or the path to an SVG.
 * @param {string} classes Additional CSS classes to apply to the icon element if it is not PNG or JPG.
 * @param {number} height Maximum rendered height in pixels for only PNG and JPG inputs.
 * @param {number} width Maximum rendered width in pixels for only PNG and JPG inputs.
 */
export default function IconComponent(props: IconComponentProps) {
  if (props.icon.endsWith(".png") || props.icon.endsWith(".jpg") || props.icon.endsWith(".svg")) {
    return (
      <div className={props.classes}>
        <Image
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: '100%' }}
          src={props.icon}
          alt="Icon" />
      </div>
    );
  } else {
    const iconClassNames = ["material-symbols-outlined"].concat(props.classes).join(" ");
    // Name of Google material icon
    return (
      <Icon className={iconClassNames}>
        {props.icon}
      </Icon>
    );
  }
}