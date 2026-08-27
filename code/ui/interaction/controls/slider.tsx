import * as React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDimensionSliderValue, setValue } from '@/state/dimension-slider-slice';
import { ScenarioDimensionsData, ScenarioDimensionStep } from '@/types/timeseries';

interface DimensionSliderProps {
    data: ScenarioDimensionsData;
}

function valuetext(value: number, values: ScenarioDimensionStep[]) {
    const selectedStep: ScenarioDimensionStep = values.find(step => step.value === value);
    return selectedStep ? selectedStep.label : 'Unknown';
}


export default function DimensionSlider({ data }: DimensionSliderProps) {
    const values: ScenarioDimensionStep[] = Object.values(data).flat();
    const min: number = values[0]?.value;
    const max: number = values[values.length - 1]?.value;
    const dispatch = useDispatch();
    const dimensionSliderValue: number | number[] = useSelector(selectDimensionSliderValue);
    const [tempValue, setTempValue] = useState(dimensionSliderValue);

    const currentValue: number = Array.isArray(tempValue) ? tempValue[0] : tempValue;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTempValue(Number(event.target.value));
    };

    const handleChangeCommitted = () => {
        dispatch(setValue(currentValue));
    }

    return (
        <div className="flex flex-col  justify-center w-full h-full p-2">
            {/* <span>{Object.keys(data).flat()}</span> ---TODO slider label if we want later */}
            <output>{valuetext(currentValue, values)}</output>
            <input
                key={`slider-${Object.keys(data).flat()}`}
                className="w-full"
                type="range"
                aria-label="Time"
                aria-valuetext={valuetext(currentValue, values)}
                value={currentValue}
                step={1}
                min={min}
                max={max}
                onChange={handleChange}
                onPointerUp={handleChangeCommitted}
                onKeyUp={handleChangeCommitted}
            />
        </div>
    );
}
