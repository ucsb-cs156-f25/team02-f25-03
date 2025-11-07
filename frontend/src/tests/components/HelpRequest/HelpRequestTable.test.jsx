// HelpRequestTable.test.jsx
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "id",
    "Requester Email",
    "Table Or Breakout Room",
    "Team ID",
    "Request Time",
    "Explanation",
    "Solved",
  ];

  const expectedFields = [
    "id",
    "requesterEmail",
    "tableOrBreakoutRoom",
    "teamId",
    "requestTime",
    "explanation",
    "solved",
  ];

  const testId = "HelpRequestTable";

  test("renders empty table correctly", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable helpRequests={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // headers should be present
    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );

    // no first-row cells
    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("Has expected headers, content, and admin buttons", async () => {
    const currentUser = currentUserFixtures.adminUser;
    const rows = helpRequestFixtures.threeHelpRequests;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable helpRequests={rows} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // headers
    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );

    // first row cells exist
    await screen.findByTestId(`${testId}-cell-row-0-col-id`);
    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    const r0 = rows[0];
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      String(r0.id),
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent(r0.requesterEmail);
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-tableOrBreakoutRoom`),
    ).toHaveTextContent(r0.tableOrBreakoutRoom);
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-teamId`),
    ).toHaveTextContent(r0.teamId);
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requestTime`),
    ).toHaveTextContent(r0.requestTime);
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-explanation`),
    ).toHaveTextContent(r0.explanation);
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent(String(r0.solved));

    const editBtn = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toHaveClass("btn-primary");

    const delBtn = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    expect(delBtn).toBeInTheDocument();
    expect(delBtn).toHaveClass("btn-danger");
  });

  test("Ordinary user sees no Edit/Delete buttons", async () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );

    await screen.findByTestId(`${testId}-cell-row-0-col-id`);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    const currentUser = currentUserFixtures.adminUser;
    const r0 = helpRequestFixtures.threeHelpRequests[0];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId(`${testId}-cell-row-0-col-id`);

    const editBtn = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    fireEvent.click(editBtn);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        `/helprequests/edit/${r0.id}`,
      ),
    );
  });

  test("Delete button calls delete endpoint with id param", async () => {
    const currentUser = currentUserFixtures.adminUser;
    const r0 = helpRequestFixtures.threeHelpRequests[0];

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/helprequests")
      .reply(200, { message: "HelpRequest deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId(`${testId}-cell-row-0-col-id`);

    const delBtn = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    fireEvent.click(delBtn);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: r0.id });
  });
});
