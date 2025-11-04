import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter as Router } from "react-router-dom";
import { vi, describe, test, expect } from "vitest";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedNavigate };
});

describe("HelpRequestTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "HelpRequestTable";

  test("renders expected columns and content for ordinary user", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestTable
            helpRequest={helpRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.userOnly}
          />
        </Router>
      </QueryClientProvider>
    );

    const headers = [
      "id",
      "Requester Email",
      "Table Or Breakout Room",
      "Team Id",
      "Request Time",
      "Explanation",
      "Solved",
    ];

    const fields = [
      "id",
      "requesterEmail",
      "tableOrBreakoutRoom",
      "teamId",
      "requestTime",
      "explanation",
      "solved",
    ];

    headers.forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());

    fields.forEach((field) => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-${field}`)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByText(/true/i)).toBeInTheDocument();

    expect(screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`)).not.toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`)).not.toBeInTheDocument();
  });

  test("renders expected columns and admin controls for admin user", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestTable
            helpRequest={helpRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </Router>
      </QueryClientProvider>
    );

    const headers = [
      "id",
      "Requester Email",
      "Table Or Breakout Room",
      "Team Id",
      "Request Time",
      "Explanation",
      "Solved",
    ];

    const fields = [
      "id",
      "requesterEmail",
      "tableOrBreakoutRoom",
      "teamId",
      "requestTime",
      "explanation",
      "solved",
    ];

    headers.forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());
    fields.forEach((field) =>
      expect(screen.getByTestId(`${testId}-cell-row-0-col-${field}`)).toBeInTheDocument()
    );

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");

    const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("clicking Edit navigates to the correct edit page", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestTable
            helpRequest={helpRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </Router>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    });

    const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/helpRequest/edit/1");
    });
  });

  test("clicking Delete sends DELETE request", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onDelete("/api/helpRequest").reply(200, { message: "Help Request deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestTable
            helpRequest={helpRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </Router>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
