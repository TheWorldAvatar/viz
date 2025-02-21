"use client";
import styles from './chart.module.css';

import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';

import { TimeSeries, TIME_CLASSES } from 'types/timeseries';
import 'chartjs-adapter-moment';

// Interface for properties
interface ChartProps {
  data: TimeSeries;
}

ChartJS.defaults.font.family = "Dosis";

/** 
 * A chart component that is based on Chart.js library.
 * 
 * @param {TimeSeries} data The processed TimeSeries data.
*/
export default function Chart(props: Readonly<ChartProps>) {
  const canvasRef: React.MutableRefObject<HTMLCanvasElement> = useRef(null);
  const chartInstance: React.MutableRefObject<ChartJS> = useRef(null);
  useEffect(() => {
    if (props.data) {
      // Destroy existing chart instance if there is a pre-existing one 
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }
      const context: CanvasRenderingContext2D = canvasRef.current.getContext('2d');

      const currentTimeSeries: TimeSeries = props.data;
      const xAxisType = TIME_CLASSES.includes(currentTimeSeries.timeClass) ? "time" : "linear";
      const yAxisType = ("Boolean" === currentTimeSeries.valuesClass) ? "category" : "linear";

      // There is a weird interaction in ChartJS with passing dynamic properties
      // My only working solution at the moment is to generate different charts with different types for the data.labels property
      if (currentTimeSeries.momentTimes.length > 0) {
        chartInstance.current = new ChartJS(context, {
          type: "line",
          data: {
            labels: currentTimeSeries.momentTimes,
            datasets: [{
              label: currentTimeSeries.name,
              pointBorderColor: "rgba(33, 150, 243, 0.70)",
              borderColor: "rgba(33, 150, 243, 0.35)",
              data: currentTimeSeries.values,
            }]
          },
        });
      } else {
        chartInstance.current = new ChartJS(context, {
          type: "line",
          data: {
            labels: currentTimeSeries.times,
            datasets: [{
              label: currentTimeSeries.name,
              pointBorderColor: "rgba(33, 150, 243, 0.70)",
              borderColor: "rgba(33, 150, 243, 0.35)",
              data: currentTimeSeries.values,
            }]
          },
        });
      }
      // Add the options separately (to reduce duplication) and the `update` method MUST be called
      chartInstance.current.options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          x: {
            type: xAxisType,
            ticks: {
              font: {
                weight: 400,
                size: 12,
              }
            },
            title: {
              display: true,
              text: "Date/Time",
              font: {
                weight: 700,
                size: 15,
              }
            }
          },
          y: {
            type: yAxisType,
            labels: ["true", "false"],
            ticks: {
              font: {
                weight: 400,
                size: 12,
              }
            },
            title: {
              display: false,
            }
          },
        },
      };
      chartInstance.current.update();

      // Clean up on component unmount
      return () => {
        if (chartInstance.current !== null) {
          chartInstance.current.destroy();
        }
      };
    }
  }, [props.data]);

  return (
    <>
      <div className={styles["chart-container"]}>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
}