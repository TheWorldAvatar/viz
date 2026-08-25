import Image from 'next/image';
import { ICON_REGISTRY } from './icon-registry.generated';
import { LucideIcon } from 'lucide-react';

interface IconComponentProps {
  readonly icon: LucideIcon | string;
  readonly classes?: string;
}

/**
 * Reusable component for displaying icons. It supports PNG, JPG, SVG, and Lucide React icons.
 *
 * Components with a hardcoded icon should import it from `lucide-react` directly
 * rather than routing through here. This exists for the icons in `public/config`,
 * which are resolved through a registry generated at build time by `scripts/generate-icon-registry.mjs`.

 * @param {LucideIcon | string} icon The icon to display: a lucide component, a URL to an image (PNG, JPG, SVG), or a lucide icon id.
 * @param {string} classes Additional CSS classes to apply to the icon element.
 */
export default function IconComponent(props: IconComponentProps) {
  if (typeof props.icon === "string" && props.icon.match(/\.(png|jpe?g|svg)$/i)) {
    return (
      <div className={props.classes}>
        <Image
          width={500}
          height={500}
          sizes="100vw"
          style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
          src={props.icon}
          alt="" />
      </div>
    );
  }

  // A string is a config name that needs the icon registry.
  const Icon: LucideIcon = typeof props.icon === "string" ? ICON_REGISTRY[props.icon] : props.icon;
  if (!Icon) {
    console.warn(`IconComponent: no icon resolved for ${JSON.stringify(props.icon)}. Names must be lucide icon ids in kebab-case (https://lucide.dev/icons).`);
    return null;
  }

  return (
    <Icon className={props.classes ?? "size-6"} aria-hidden />
  );
}