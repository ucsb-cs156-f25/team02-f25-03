import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/HelpRequestUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/useCurrentUser";

export default function HelpRequestTable({ helpRequests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    const id = cell.row.original.id;
    navigate(`/helprequests/edit/${id}`);
  };

  // Stryker disable all : hard to test for query caching / invalidation key
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/helprequests/all"],
  );
  // Stryker restore all

  const deleteCallback = async (cell) => {
    const id = cell.row.original.id;
    deleteMutation.mutate({ row: { values: { id }, original: {} } });
  };

  const columns = [
    { header: "id", accessorKey: "id" },
    { header: "Requester Email", accessorKey: "requesterEmail" },
    { header: "Table Or Breakout Room", accessorKey: "tableOrBreakoutRoom" },
    { header: "Team ID", accessorKey: "teamId" },
    { header: "Request Time", accessorKey: "requestTime" },
    { header: "Explanation", accessorKey: "explanation" },
    {
      header: "Solved",
      id: "solved",
      cell: ({ row }) => row.original.solved.toString(),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "HelpRequestTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "HelpRequestTable"),
    );
  }

  return (
    <OurTable
      data={helpRequests}
      columns={columns}
      testid={"HelpRequestTable"}
    />
  );
}
