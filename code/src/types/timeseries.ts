import moment from 'moment';

export type TimeSeries = {
    name: string;
    timeClass: string;
    momentTimes: moment.Moment[];
    times: number[];
    unit: string;
    values: number[];
    valuesClass: string;
};

export type ScenarioDimensionStep = {
    value: number;
    label: string;
};

export type ScenarioDimensionsData = {
    [key: string]: ScenarioDimensionStep[];
};

export const TIME_CLASSES = ["LocalDateTime", "ZonedDateTime", "Instant", "OffsetDateTime", "LocalDate"];
