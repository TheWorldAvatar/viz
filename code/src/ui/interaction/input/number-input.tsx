
import { useDictionary } from "hooks/useDictionary";
import { useRef } from "react";
import { Dictionary } from "types/dictionary";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputMode: "decimal" | "numeric";
  onInputChange: (value: string) => void;
  numberPattern?: string;
  steps?: number;
}

/** A component to display a number input with custom translation logic.
 *
 * @param {"decimal" | "numeric"} inputMode Only these two input modes are valid
 * @param onInputChange Function to be executed on input change
 * @param {string} numberPattern Optional validation step based on a regex pattern.
 * @param {number} steps Optional override for the number of steps to increment or decrement the value by.
 */
export default function NumberInput(props: Readonly<NumberInputProps>) {
  const dict: Dictionary = useDictionary();
  const lastKeyPressTime: React.RefObject<number> = useRef<number>(0);

  const displayValue: string | number = dict.toNumberDisplay(props.value);
  const { onInputChange, numberPattern, steps, ...restOfProps } = props;
  const stepsAndScaleFactor: number[] = getStepsAndScaleFactor(props.inputMode, steps);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const now = Date.now();
    if (now - lastKeyPressTime.current >= 200) {
      const currentValue: number = Number(props.value);
      if (event.key === "ArrowUp") {
        const result: number = performIncrementDecrement(
          currentValue,
          stepsAndScaleFactor[0],
          stepsAndScaleFactor[1],
          numberPattern,
          true
        );
        onInputChange(String(result));
        lastKeyPressTime.current = now;
      } else if (event.key === "ArrowDown") {
        const result: number = performIncrementDecrement(
          currentValue,
          stepsAndScaleFactor[0],
          stepsAndScaleFactor[1],
          numberPattern,
          false
        );
        onInputChange(String(result));
        lastKeyPressTime.current = now;
      }
    }
  };

  return (
    <input
      {...restOfProps}
      type="text"
      value={displayValue}
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        const normalisedNumber: string = dict.normaliseNumber(e.target.value);
        onInputChange(normalisedNumber);
      }}
    />
  );
}

/**
 * Retrieve the steps and scale factor based on input mode and default value.
 *
 * @param {"decimal" | "numeric"} inputMode The type of input mode
 * @param {number} steps Optional override for the number of steps to increment or decrement the value by.
 */
export function getStepsAndScaleFactor(
  inputMode: "decimal" | "numeric",
  steps?: number,
): number[] {
  if (inputMode === "numeric") {
    return [steps ?? 1, 1];
  }
  const decimalSteps: number = 0.01;
  const stepStr: string = steps ? steps.toString() : decimalSteps.toString();
  if (stepStr.includes("e-")) {
    const exponentPart: string = stepStr.split("e-")[1];
    return [steps ?? decimalSteps, Math.pow(10, parseInt(exponentPart, 10))];
  } else if (stepStr.includes(".")) {
    return [steps ?? decimalSteps, Math.pow(10, stepStr.split(".")[1].length)];
  }
}

/**
 * Perform the increment or decrement of a value.
 *
 * @param value the current value to be incremented or decremented.
 * @param steps the number of steps to increment or decrement the value by.
 * @param scaleFactor the scale factor to use for the operation.
 * @param regexEx the regex expression.
 * @param isAddition indicates if the operation is addition (true) or subtraction (false).
 */
export function performIncrementDecrement(
  value: number,
  steps: number,
  scaleFactor: number,
  regexEx: string,
  isAddition: boolean
): number {
  const parsedVal: number = isNaN(value) ? 0 : value;
  let result: number = computeIncrementDecrement(
    Math.round(parsedVal / steps) * steps,
    steps,
    scaleFactor,
    isAddition
  );
  // The result must match the pattern and values will continue to be decremented until they are
  if (regexEx) {
    const stepString: string = String(steps);
    const decimalPlaces: number = stepString.includes(".")
      ? stepString.split(".")[1].length
      : 0;
    const pattern: RegExp = new RegExp(regexEx);
    while (!pattern.test(result.toFixed(decimalPlaces))) {
      result = computeIncrementDecrement(
        result,
        steps,
        scaleFactor,
        isAddition
      );
    }
  }
  return result;
}

/**
 * Computes the increment or decrement of a value based on the given steps and scale factor.
 *
 * @param value the current value to be incremented or decremented.
 * @param steps the number of steps to increment or decrement the value by.
 * @param scaleFactor the scale factor to use for the operation.
 * @param isAddition indicates if the operation is addition (true) or subtraction (false).
 */
function computeIncrementDecrement(
  value: number,
  steps: number,
  scaleFactor: number,
  isAddition: boolean
): number {
  // Scale up for decimals, but integers will always have 1 as a scale factor
  const scaledCurrentValue: number = Math.round(value * scaleFactor);
  const scaledStep: number = Math.round(steps * scaleFactor);
  if (isAddition) {
    return (scaledCurrentValue + scaledStep) / scaleFactor;
  }

  return (scaledCurrentValue - scaledStep) / scaleFactor;
}

