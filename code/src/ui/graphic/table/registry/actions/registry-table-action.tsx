import { Button, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { Routes } from "io/config/routes";
import { getAfterDelimiter, isValidIRI } from "utils/client-utils";
import { RegistryTaskOption } from "types/form";
import { Status } from "ui/text/status/status";

interface RegistryRowActionsProps {
  recordType: string;
  lifecycleStage: string;
  row: any;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

export default function RegistryRowActions(
  props: Readonly<RegistryRowActionsProps>
) {
  const router = useRouter();

  const recordId: string = props.row.id
    ? isValidIRI(props.row.id)
      ? getAfterDelimiter(props.row.id, "/")
      : props.row.id
    : props.row.iri;

  const handleClickView = (): void => {
    if (
      props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
      props.lifecycleStage == Routes.REGISTRY_ARCHIVE
    ) {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY_REPORT}/${recordId}`);
    } else if (
      props.lifecycleStage == Routes.REGISTRY_TASK_DATE ||
      props.lifecycleStage == Routes.REGISTRY_REPORT
    ) {
      let status: string;
      if (
        props.row.order === "0" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/OrderReceivedEvent"
      ) {
        status = Status.PENDING_DISPATCH;
      } else if (
        props.row.order === "1" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent"
      ) {
        status = Status.PENDING_EXECUTION;
      } else if (
        props.row.order === "2" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/ServiceDeliveryEvent"
      ) {
        status = Status.COMPLETED;
      } else if (
        props.row.order === "3" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/TerminatedServiceEvent"
      ) {
        status = Status.CANCELLED;
      } else if (
        props.row.order === "4" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/IncidentReportEvent"
      ) {
        status = Status.INCOMPLETE;
      } else {
        status = "";
      }
      props.setTask({
        id: recordId,
        status: status,
        contract: props.row.contract,
      });
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  return (
    <Tooltip title="View Details">
      <Button
        type="link"
        icon={
          <span className="material-symbols-outlined">expand_circle_right</span>
        }
        onClick={handleClickView}
      />
    </Tooltip>
  );
}
