import styles from './table.module.css';


import { TimeSeries } from 'types/timeseries';

interface TableProps {
  data: TimeSeries;
}

/**
 * This component renders a table populated with the time series data.
 * 
 * @param {TimeSeries} data The group to render.
 */
export default function Table(props: Readonly<TableProps>) {
  const currentTimeSeries: TimeSeries = props.data;
  return (
    <div className={styles["table"]}>
      <p>Data series</p>
      <div className={styles["content"]}>
        {currentTimeSeries.values.map((value, index) => (
          <div key={index} className={styles["entry"]}>
            <span className={styles["entry-header"]}>{value}</span>
            <span>at date/time:</span>
            <span>{currentTimeSeries.times[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}