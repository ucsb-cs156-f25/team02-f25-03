import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect, vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByText(/Requester Email/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Requester Email/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a HelpRequest", async () => {
    render(
      <Router>
        <HelpRequestForm initialContents={helpRequestFixtures.oneHelpRequest} />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-id");
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue("1");
  });

  test("shows correct error messages on bad input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-requesterEmail");

    const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
    const explanationField = screen.getByTestId("HelpRequestForm-explanation");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "not a requesterEmail" } });

    fireEvent.change(explanationField, {
      target: {
        value:
          "ss d f fg. d d s a s de f. g we d cd v sf s. sa v. ds a sf ds s fa sd asd as das s ad ad as dasd a sd asd a".repeat(10),
      },
    });

    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email must be a valid email address\./);
    expect(
      screen.getByText(/Requester Email must be a valid email address\./),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Explanation must be at most 255 characters\./),
    ).toBeInTheDocument();
  });

  test("shows correct error messages on missing required fields", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-submit");
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await screen.findByText(/Requester Email is required\./);

    expect(screen.getByText(/Requester Email is required\./)).toBeInTheDocument();
    expect(
      await screen.findByText(/Team Id must be a number\./)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Table Or Breakout Room must be a number\./)
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required\./)).toBeInTheDocument();
  });

  test("no error messages on good input and submitAction receives normalized payload", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-requesterEmail");

    const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
    const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
    const tableOrBreakoutRoomField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const explanationField = screen.getByTestId("HelpRequestForm-explanation");
    const solvedField = screen.getByTestId("HelpRequestForm-solved");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "testEmailID16@ucsb.edu" } });
    fireEvent.change(teamIdField, { target: { value: "16" } });
    fireEvent.change(tableOrBreakoutRoomField, { target: { value: "16" } });
    fireEvent.change(requestTimeField, { target: { value: "2022-01-02T12:00" } });
    fireEvent.change(explanationField, {
      target: { value: "pass locally but fail on GitHub." },
    });

    // toggle solved
    fireEvent.click(solvedField);

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    const payload = mockSubmitAction.mock.calls[0][0];
    expect(payload.requestTime).toBe("2022-01-02T12:00");
    expect(payload.solved).toBe(true);

    // no validation errors present
    expect(screen.queryByText(/Requester Email must be a valid email address\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Requester Email is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Team Id is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Table Or Breakout Room is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Request Time is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Explanation is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Explanation must be at most 255 characters\./)).not.toBeInTheDocument();
  });

  test("shows numeric pattern errors for Team Id and Table Or Breakout Room", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    // fill only what's needed to reach pattern validation
    await screen.findByTestId("HelpRequestForm-requesterEmail");
    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
      target: { value: "user@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2025-01-01T09:00" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "ok" },
    });

    // INVALID: non-numeric inputs to trigger pattern
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "t16" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"), {
      target: { value: "Table 3" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    // Assert the exact messages from your form
    await screen.findByText(/Team Id must be a number\./);
    await screen.findByText(/Table Or Breakout Room must be a number\./);
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    // pre-assertion so the linter is satisfied immediately
    expect(mockedNavigate).not.toHaveBeenCalled();

    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-cancel");
    fireEvent.click(screen.getByTestId("HelpRequestForm-cancel"));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });

    // explicit assertion outside waitFor (the linter sees this for sure)
    expect(mockedNavigate).toHaveBeenCalled();
  });

});