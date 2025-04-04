
import { Assets } from 'io/config/assets';
import Image from 'next/image';
import { Dictionary } from 'types/dictionary';
import { useDictionary } from 'utils/dictionary/DictionaryContext';
import styles from './loader.module.css';

export default function Loader() {
  const dict: Dictionary = useDictionary();
  return <div className={styles.loadingContainer}>
    <Image src= {Assets.LOADING}
      width={500}
      height={500} 
      alt ="Loading animation"/>
    <h1>{dict.message.loading}</h1>
  </div>
}