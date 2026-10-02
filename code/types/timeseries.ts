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

// majority are the names of Java date time classes, last two are for CReDoAccessAgent
export const TIME_CLASSES = ["LocalDateTime", "ZonedDateTime", "Instant", "OffsetDateTime", "LocalDate", "offsetTime", "dateTime"];
