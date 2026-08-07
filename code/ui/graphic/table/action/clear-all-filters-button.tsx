import { ColumnFilter } from "@tanstack/react-table";
import { TableDescriptor } from "@/hooks/table/useTable";
import { TableScrollDescriptor } from "@/hooks/table/useTableScroll";
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import Button, { ButtonVariant } from "@/ui/interaction/button";


interface ClearAllFiltersButtonProps {
  tableDescriptor: TableDescriptor;
  tableScrollDescriptor: TableScrollDescriptor;
  disabled: boolean;
  pinnedFilter?: ColumnFilter;
  variant?: ButtonVariant;
}

/**
 * A button that clears every active column filter along with any row selection and custom row order.
 *
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param {TableScrollDescriptor} tableScrollDescriptor A descriptor containing the required table scroll functionalities.
 * @param {boolean} disabled A boolean indicating whether the button is disabled.
 * @param {ColumnFilter} pinnedFilter An optional filter that must survive the reset, such as the account that an invoice is being raised for.
 * @param {ButtonVariant} variant An optional button variant, e.g., "primary", "secondary", etc. This controls the button's appearance.
 */
export default function ClearAllFiltersButton(props: Readonly<ClearAllFiltersButtonProps>) {
  const dict: Dictionary = useDictionary();

  return (
    <Button
      leftIcon="filter_list_off"
      aria-label={dict.action.clearAllFilters}
      iconSize="medium"
      className="mt-1"
      disabled={props.disabled}
      size="icon"
      onClick={() => {
        if (props.pinnedFilter) {
          props.tableDescriptor.setFilters([props.pinnedFilter]);
        } else {
          props.tableDescriptor.table.resetColumnFilters();
        }
        props.tableDescriptor.clearSelectedRowIds();
        props.tableDescriptor.resetOrder();
        props.tableScrollDescriptor.scrollToTop();
      }}
      tooltipText={dict.action.clearAllFilters}
      variant={props.variant || "destructive"}
    />
  );
}
