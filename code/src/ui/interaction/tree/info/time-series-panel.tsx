import styles from './info-tree.module.css';

import { useState } from 'react';

import { TimeSeries } from 'types/timeseries';
import Chart from 'ui/graphic/chart/chart';
import Table from 'ui/graphic/table/table';
import DropdownField, { DropdownFieldOption } from 'ui/interaction/dropdown/dropdown';

interface TimeSeriesPanelProps {
    data: TimeSeries[];
}

/**
 * This component is responsible for displaying time series information as a panel.
 * 
 * @param {TimeSeries[]} data The queried time series data.
 */
export default function TimeSeriesPanel(props: Readonly<TimeSeriesPanelProps>) {
    const tsData: TimeSeries[] = props.data;
    const [selectedTimeSeriesOption, setSelectedTimeSeriesOption] = useState(0);

    const parseTimeSeriesIntoOptions = (timeSeries: TimeSeries[]): DropdownFieldOption[] => {
        const options: DropdownFieldOption[] = [];
        timeSeries.forEach((ts, index) => {
            const label: string = ts.unit === "-" ? ts.name : ts.name + " [" + ts.unit + "]";
            options.push({ index: index, label: label });
        });
        return options;
    };

    return (
        <div className={styles["time-series-panel"]}>
            <DropdownField options={parseTimeSeriesIntoOptions(tsData)} selectedIndex={selectedTimeSeriesOption} setSelectedIndex={setSelectedTimeSeriesOption} />
            <Chart data={tsData} selectedIndex={selectedTimeSeriesOption} />
            <Table data={tsData} selectedIndex={selectedTimeSeriesOption} />
        </div>
    );
}