
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputMode: "decimal" | "numeric";
  onInputChange: (value: string) => void;
}

/** A component to display a number input with custom translation logic.
 *
 * @param {"decimal" | "numeric"} inputMode Only these two input modes are valid
 * @param onInputChange Function to be executed on input change
 */
export default function NumberInput(props: Readonly<NumberInputProps>) {
  const { onInputChange, ...restOfProps } = props;
  const dict: Dictionary = useDictionary();
  const displayValue: string | number = dict.toNumberDisplay(props.value);

  return (
    <input
      {...restOfProps}
      type="text"
      value={displayValue}
      onChange={(e) => {
        const normalisedNumber: string = dict.normaliseNumber(e.target.value);
        onInputChange(normalisedNumber);
      }}
    />
  );
}
