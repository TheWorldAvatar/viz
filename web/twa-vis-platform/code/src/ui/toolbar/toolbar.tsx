"use client";

import styles from "./toolbar.module.css";

import React from "react";
import SVG from 'react-inlinesvg';
import { Link } from "@mui/material";

import ToolbarComponent from "./toolbar-component";
import { IllegalArgumentError } from "../../utils/errors";

// Type definition for toolbar properties
export type ToolbarProps = {
    landing: boolean,
    help: boolean,
    dashboard: boolean,
    toolbarLogo: string
}

type ToolbarState = {
    activeTab: string
}

/**
 * Represents the top level toolbar, that loads a number of 
 * custom toolbar components.
 */
export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    state: ToolbarState = {
        activeTab: "LANDING"
    }

    /**
     * Array of registered buttons for display.
     */
    private components: ToolbarComponent[] = [];

    /**
     * Initialise a new toolbar.
     */
    constructor(props: ToolbarProps) {
        super(props);
        this.initialiseDefault();
    }

    /**
     * Add default toolbar components to this toolbar instance.
     */
    private initialiseDefault() {
        // Return to landing
        if(this.props.landing) {
            this.addComponent(new ToolbarComponent({
                name: "LANDING",
                tooltip: "Return to landing page.",
                icon: "home",
                url: "/"
            }));
        }

        // Go to help page
        if(this.props.help) {
            this.addComponent(new ToolbarComponent({
                name: "HELP",
                tooltip: "Open help page.",
                icon: "help",
                url: "/help"
            }));
        }

        // Go to map
        this.addComponent(new ToolbarComponent({
            name: "MAP",
            tooltip: "Geospatial view.",
            icon: "public",
            url: "/visualisation"
        }));

        // Go to dashboard
        if(this.props.dashboard) {
            this.addComponent(new ToolbarComponent({
                name: "DASH",
                tooltip: "Analytics view.",
                icon: "monitoring",
                url: "/analytics"
            }));
        }
    }

    /**
     * 
     * @param component 
     */
    public addComponent(component: ToolbarComponent) {
        const collision = this.getComponent(component.props.name);
        if(collision != null) {
            throw new IllegalArgumentError("Already contains a component with this name.");
        }

        this.components.push(component);
    }

    /**
     * Removes the component with the input name.
     * 
     * @param name component name.
     */
    public removeComponent(name: string) {
        let index = -1;
        for(let i = 0; i < this.components.length; i++) {
            if(this.components[i].props.name === name) {
                index = i;
                break;
            }
        }

        if(index >= 0) {
            this.components.splice(index, 1);
        }
    }


    /**
     * Returns the registered component with the input
     * name (or null).
     * 
     * @param name target name.
     */
    private getComponent(name: string): ToolbarComponent {
        for(const element of this.components) {
            if(element.props.name === name) {
                return element;
            }
        }
        return null;
    }

    /**
     * Renders the component for the top level toolbar.
     * 
     * @returns JSX for toolbar element.
     */
    public render() {
        const toolbarSVG = this.props.toolbarLogo.toString();

        const children = this.components.map((component) => (
            React.createElement(ToolbarComponent, {
                ...component.props,
                key: component.props.name,
                // active: this.state.activeTab === component.props.name,
                // callback: this.setActiveTab
            }, null)
        ));

        return (
            <div
                id="toolbar"
                className={styles.toolbar}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}>
                
                <Link href="/">
                    <div className="toolbarLogo">
                        <SVG
                            src={toolbarSVG}
                        />
                    </div>
                </Link>

                <div className={styles.spacer}/>
                {children}
            </div>
        )
    }
}
