import styles from './info-tree.module.css';
import parentStyles from '../floating-panel.module.css';

import React, { useState } from 'react';

import { Attribute, AttributeGroup } from 'types/attribute';
import HeaderField from 'ui/text/header';
import { useDispatch } from 'react-redux';
import { setHasExistingData } from 'state/floating-panel-slice';
import { setIri, setStack } from 'state/map-feature-slice';

// type definition for incoming properties
interface AttributeRootProps {
  attribute: AttributeGroup;
}

interface AttributeNodeProps {
  group: AttributeGroup;
  depth: number;
}

interface AttributeTextNodeProps {
  attributes: Attribute[];
  depth: number;
}

/**
 * This component renders the input attributes as a tree starting from this root.
 *
 * @param {AttributeGroup} attribute The attribute group to render.
 */
export default function AttributeRoot(props: Readonly<AttributeRootProps>) {
  // This component is separate from the SubNode as the root node should not be indented and depth should start at 0
  return (
    <>
      <AttributeTextNode
        attributes={props.attribute.attributes}
        depth={0}
      />
      {props.attribute.subGroups.map((subGroup) => {
        return (
          <AttributeNode
            group={subGroup}
            depth={0}
            key={subGroup.name + "_" + 0}
          />)
      })}
    </>
  );
}


/**
 * This component is a recursive element that renders the subgroups and its attributes recursively.
 *
 * @param {AttributeGroup} group The attribute group to render.
 * @param {number} depth The current depth to this group tree.
 */
function AttributeNode(props: Readonly<AttributeNodeProps>) {
  const dispatch = useDispatch();
  const group: AttributeGroup = props.group;
  const depth: number = props.depth;
  // Size of left hand indentation
  const spacing: string = depth * 0.5 + "rem";
  // State for managing collapse and expansion
  const [isCollapsed, setIsCollapsed] = useState<boolean>(group.isCollapsed);
  const collapsedIcon: string = isCollapsed ? "keyboard_arrow_down" : "keyboard_arrow_up";
  const displayIcon: string = group.subQueryIri ? "/images/defaults/icons/fia-logo.svg" : collapsedIcon;

  const toggleExpansion = () => {
    if (group.subQueryIri) {
      dispatch(setHasExistingData(true));
      dispatch(setIri(group.subQueryIri));
      // Only update the selected stack if it is required for the subquery
      if (group.subQueryStack) {
        dispatch(setStack(group.subQueryStack));
      }
    }
    else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Header element differs for root element in styling
  const headerElement = depth === 0 ?
    <HeaderField
      name={group.name}
      icon={displayIcon}
      containerStyle={parentStyles.treeHeader}
      headerNameStyle={parentStyles.treeHeaderName}
      spacing={spacing}
      toggleExpansion={toggleExpansion}
    /> : <HeaderField
      name={group.name}
      icon={displayIcon}
      containerStyle={styles.treeEntrySubHeader}
      headerNameStyle={styles.treeEntrySubHeaderName}
      spacing={spacing}
      toggleExpansion={toggleExpansion}
    />;

  return (
    <div className={styles.treeEntry}>
      {headerElement}

      {/* Elements */}
      {!isCollapsed && (<>
        <AttributeTextNode
          attributes={group.attributes}
          depth={depth + 1}
        />
        {group.subGroups.map((subGroup) => {
          return (<AttributeNode
            group={subGroup}
            depth={depth + 1}
            key={subGroup.name + "_" + (depth + 1)}
          />)
        })} </>
      )}
    </div>
  );
}

/**
 * This component renders the attribute for each entry.
 *
 * @param {Attribute[]} attributes The list of attributes that should be rendered.
 * @param {number} depth The current depth to this group tree.
 */
function AttributeTextNode(props: Readonly<AttributeTextNodeProps>) {
  const elements: React.ReactElement[] = [];
  const spacing: string = props.depth * 0.5 + "rem";

  props.attributes.map((attribute) => {
    elements.push(
      <p className={styles.treeAttributeEntry} style={{ paddingLeft: spacing }} key={attribute.name + "_" + props.depth}>
        {/* Attribute: Value */}
        <span className={styles.treeAttributeKey}>{attribute.name}:&nbsp;</span>
        {typeof attribute.value === "string" && attribute.value.startsWith("<") ?
          (<div dangerouslySetInnerHTML={{ __html: attribute.value }} />) :
          (<span className={styles.treeAttributeValue}>
            {attribute.value}&nbsp;{attribute.unit}
          </span>)}
      </p>
    );
  });
  return elements;
}