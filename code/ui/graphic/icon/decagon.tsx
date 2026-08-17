
interface DecagonIconComponentProps {
  readonly color: string;
}

/**
 * Decagon icon with Tailwind layout, placed left of text.
 */
export default function DecagonIconComponent(props: DecagonIconComponentProps) {
  return (
    <div className={`flex items-center gap-2`}>
      <div
        className="w-6 h-6"
        style={{
          backgroundColor: props.color,
          clipPath:
            'polygon(34.54915% 2.44717%,65.45085% 2.44717%,90.45085% 20.61074%,100% 50%,90.45085% 79.38926%,65.45085% 97.55283%,34.54915% 97.55283%,9.54915% 79.38926%,0% 50%,9.54915% 20.61074%)',
        }}
      />
    </div>
  );
}