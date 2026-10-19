import { ColourProfilesDescriptor } from "@/hooks/table/api/useColourProfiles";
import { useDictionary } from "@/hooks/useDictionary";
import { ColourProfile } from "@/types/colour-profile";
import { Dictionary } from "@/types/dictionary";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import Button from "@/ui/interaction/button";
import { interpolate } from "@/utils/client-utils";
import { Check, Palette } from "lucide-react";
import React from "react";

interface ColourProfileSelectorProps {
  colourProfiles: ColourProfilesDescriptor;
}

/**
 * An icon button that opens a menu to choose the active colour profile of a table.
 * The button is highlighted when a profile is active, so that no text is needed on the ribbon.
 *
 * @param {ColourProfilesDescriptor} colourProfiles The colour profiles of the table and the active selection.
 */
export default function ColourProfileSelector(props: Readonly<ColourProfileSelectorProps>) {
  const dict: Dictionary = useDictionary();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const labelId: string = React.useId();
  const { profiles, activeProfileId, setActiveProfileId } = props.colourProfiles;
  const activeProfile: ColourProfile | undefined = profiles.find((profile) => profile.id === activeProfileId);
  const buttonLabel: string = interpolate(dict.title.colourProfileActive, activeProfile?.name ?? dict.title.defaultColourProfile);

  const handleSelect = (id: string | null): void => {
    setActiveProfileId(id);
    setIsOpen(false);
  };

  return (
    <PopoverActionButton
      placement="bottom-end"
      leftIcon={Palette}
      size="icon"
      variant={activeProfile ? "info_banner" : "outline"}
      tooltipText={buttonLabel}
      aria-label={buttonLabel}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex flex-col gap-1 min-w-56 max-h-80 overflow-y-auto"
      >
        <p id={labelId} className="sticky top-0 z-10 bg-muted px-2 py-1 font-semibold">
          {dict.title.colourProfiles}
        </p>
        {/* The default option applies no colour profile */}
        <ColourProfileOption
          label={dict.title.defaultColourProfile}
          isActive={!activeProfile}
          onClick={() => handleSelect(null)}
        />
        {profiles.map((profile) => (
          <ColourProfileOption
            key={profile.id}
            label={profile.name}
            isActive={profile.id === activeProfile?.id}
            onClick={() => handleSelect(profile.id)}
          />
        ))}
        {profiles.length === 0 && (
          <p className="px-3 py-1 text-sm text-foreground/70 italic">{dict.title.noColourProfiles}</p>
        )}
      </div>
    </PopoverActionButton>
  );
}

interface ColourProfileOptionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * An option in the colour profile menu, with a check mark when active.
 *
 * @param {string} label The display name of the option.
 * @param {boolean} isActive Indicates if the option is the active selection.
 * @param onClick Click handler for the option.
 */
function ColourProfileOption(props: Readonly<ColourProfileOptionProps>) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      aria-pressed={props.isActive}
      onClick={props.onClick}
    >
      <span className="flex w-full items-center gap-2">
        {props.isActive
          ? <Check className="size-4 shrink-0" aria-hidden="true" />
          : <span className="size-4 shrink-0" aria-hidden="true" />}
        <span className="truncate">{props.label}</span>
      </span>
    </Button>
  );
}
