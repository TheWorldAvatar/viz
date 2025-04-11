"use client";

import styles from './navbar.module.css';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';

import { Routes } from 'io/config/routes';
import { useEffect, useMemo } from 'react';
import { addItem, selectItem } from 'state/context-menu-slice';
import { UISettings } from 'types/settings';
import IconComponent from 'ui/graphic/icon/icon';
import KeycloakUserButton from 'ui/interaction/auth/keycloak-user-button';
import { ContextItemDefinition } from 'ui/interaction/context-menu/context-item';
import { useDictionary } from 'utils/dictionary/DictionaryContext';
import NavbarComponent from './navbar-component';

// Type definition for navbar properties
interface NavbarProps {
  settings: UISettings;
}

/**
 * Represents the top level navigation bar, that loads a number of 
 * custom navbar components.
 */
export default function Navbar(props: Readonly<NavbarProps>) {
  const dict = useDictionary();

  const keycloakEnabled = process.env.KEYCLOAK === 'true';
  const navbarDict = dict.nav;
  const contextDict = dict.context;
  const navbarItem: ContextItemDefinition = useMemo(() => {
    return {
      name: contextDict.navBar.title,
      description: contextDict.navBar.tooltip,
      id: "navbar",
      toggled: true
    };
  }, []);

  const dispatch = useDispatch();
  const keycloakEnabled = process.env.KEYCLOAK === 'true';

  useEffect(() => {
    dispatch(addItem(navbarItem));
  }, [])


  // Visibility state of navigation bar
  const navbarState = useSelector(selectItem(navbarItem.id));

  // Do not show if state exists and is disabled
  if (navbarState?.toggled != null && !navbarState.toggled) {
    return null;
  }
  // Backwards compatibility for navbar logo
  if (props.settings.branding.navbarLogo) {
    props.settings.branding.navbar = props.settings?.branding?.navbarLogo;
  }
  return (
    <div id="navbar" className={styles.navbar}>
      {/* Render navbar logo if set */}
      {props.settings?.branding?.navbar?.length > 0 &&
        // Handle the case where navbar is a list
        <div className={styles["logo-ribbon"]}>
          {
            Array.isArray(props.settings?.branding?.navbar) ? (
              props.settings?.branding?.navbar.map(logo => (
                <Link key={logo} href={Routes.HOME}>
                  <IconComponent
                    icon={logo}
                    classes={styles["logo"]}
                  />
                </Link>
              ))
            ) : (
              // Handle the case where navbar is a string
              <Link href={Routes.HOME}>
                <IconComponent
                  icon={props.settings?.branding?.navbar}
                  classes={styles["logo"]}
                />
              </Link>
            )
          }
        </div>
      }

      {/* Render each component as required */}
      <div className="navbarElements">
        {keycloakEnabled && <KeycloakUserButton />}
        {props.settings?.modules?.landing &&
          <NavbarComponent
            name="LANDING"
            tooltip={navbarDict.tooltip.home}
            icon="home"
            url={Routes.HOME} />
        }
        {props.settings?.modules?.map &&
          <NavbarComponent
            name="MAP"
            tooltip={navbarDict.tooltip.map}
            icon="public"
            url={Routes.MAP} />
        }
        {props.settings?.modules?.dashboard &&
          <NavbarComponent
            name="DASH"
            tooltip={navbarDict.tooltip.dashboard}
            icon="monitoring"
            url={Routes.DASHBOARD} />
        }
        {props.settings?.modules?.help &&
          <NavbarComponent
            name="HELP"
            tooltip={navbarDict.tooltip.help}
            icon="help"
            url={Routes.HELP} />
        }
        {props.settings?.modules?.registry &&
          <NavbarComponent
            name="REGISTRY"
            tooltip={navbarDict.tooltip.registry}
            icon="contract"
            url={`${Routes.REGISTRY_PENDING}/${props.settings?.resources?.registry?.data}`} />
        }
      </div>
    </div>
  );
}