import parentStyles from "../floating-panel.module.css";

import { useState } from "react";

import { LegendGroup, LegendSettings } from "types/settings";
import DecagonIconComponent from "ui/graphic/icon/decagon";
import IconComponent from "ui/graphic/icon/icon";
import HeaderField from "ui/text/header";

// Incoming parameters for component.
interface LegendTreeProps {
  settings: LegendSettings;
}

interface LegendTreeNodeProps {
  group: LegendGroup;
  groupName: string;
}

/**
 * Displays a legend component based on the user's input for legend settings.
 */
export default function LegendTree(props: Readonly<LegendTreeProps>) {
  return (
    <div className="w-full h-[inherit] flex flex-col p-4">
      {Object.entries(props.settings).map(([groupName, group]) => {
        return (
          <LegendTreeNode key={groupName} groupName={groupName} group={group} />
        );
      })}
    </div>
  );
}

function LegendTreeNode(props: Readonly<LegendTreeNodeProps>) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const collapsedIcon: string = isCollapsed
    ? "keyboard_arrow_right"
    : "keyboard_arrow_down";
  const toggleExpansion = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      key={props.groupName}
      className="w-full block flex-col mb-1 box-border p-1.5 hover:bg-background-secondary"
    >
      <HeaderField
        name={props.groupName}
        icon={collapsedIcon}
        containerStyle={parentStyles.treeHeader}
        headerNameStyle={parentStyles.treeHeaderName}
        isLoading={false}
        spacing="0"
        toggleExpansion={toggleExpansion}
      />
      {Object.entries(props.group).map(([item, legendSettings]) => {
        if (!isCollapsed) {
          return (
            <div key={props.groupName + item}>
              <div className="grid grid-cols-[1.6rem_calc(100%-1.6rem)] gap-2 mt-2 items-center">
                {legendSettings.type === "symbol" && (
                  <IconComponent icon={legendSettings.icon} />
                )}
                {legendSettings.type === "fill" && (
                  <DecagonIconComponent color={legendSettings.fill} />
                )}
                {legendSettings.description ? (
                  <h4 className="text-base">{item}</h4>
                ) : (
                  <span className="text-sm">{item}</span>
                )}
              </div>
              {legendSettings.description && (
                <span className="text-sm">{legendSettings.description}</span>
              )}
            </div>
          );
        }
      })}
    </div>
  );
}
