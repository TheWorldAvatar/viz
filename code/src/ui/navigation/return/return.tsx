import iconStyles from 'ui/graphic/icon/icon-button.module.css';
import styles from './return.module.css';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import MaterialIconButton from 'ui/graphic/icon/icon-button';
import { setIsOpen } from 'state/modal-slice';

interface ReturnButtonProps {
  styles?: string;
}

/**
 * A button that returns back to the home page.
 * @param {string} styles Additional styles for return button if required.
 * 
 * @returns A return button element to the home page.
 */
export default function ReturnButton(props: Readonly<ReturnButtonProps>) {
  const router = useRouter();
  const dispatch = useDispatch();

  const onReturn = () => {
    dispatch(setIsOpen(false));
    router.back();
  };

  return (
    <button type="button" className={`${styles.button} ${props.styles}`} onClick={onReturn}>
      <MaterialIconButton
        iconName="arrow_circle_left"
        iconStyles={[iconStyles["large-icon"]]}
        className={iconStyles["elongated-icon-button-container"]}
      />
    </button>
  )
}