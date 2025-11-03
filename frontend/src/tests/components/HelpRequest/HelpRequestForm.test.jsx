import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { MemoryRouter as Router } from "react-router-dom"; // DOM router
import { vi, expect, test, describe } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const originalModule = await vi.importActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const noop = () => {};

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
    await screen.findByTestId(/HelpRequestForm-id/);
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(/HelpRequestForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <HelpRequestForm />
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

    fireEvent.change(requesterEmailField, { target: { value: "not a requesterEmail" } });
    fireEvent.change(teamIdField, { target: { value: "not a teamId" } });
    fireEvent.change(tableOrBreakoutRoomField, { target: { value: "not a tableOrBreakoutRoom" } });
    fireEvent.change(requestTimeField, { target: { value: "not a requestTime" } });
    fireEvent.change(explanationField, {
      target: {
        value:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.",
      },
    });
    // If solved is a checkbox in your form, prefer click:
    // fireEvent.click(solvedField);
    fireEvent.change(solvedField, { target: { value: "not a solved" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email must be a valid email address\./);

    expect(screen.getByText(/Requester Email must be a valid email address\./)).toBeInTheDocument();
    expect(screen.getByText(/Team Id must be a number\./)).toBeInTheDocument();
    expect(screen.getByText(/Table Or Breakout Room must be a number\./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation must be at most 250 characters\./)).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-submit");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email is required\./);

    expect(screen.getByText(/Requester Email is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Team Id is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Table Or Breakout Room is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required\./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
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

    fireEvent.change(requesterEmailField, { target: { value: "chrisgaucho@ucsb.edu" } });
    fireEvent.change(teamIdField, { target: { value: "16" } });
    fireEvent.change(tableOrBreakoutRoomField, { target: { value: "16" } });
    fireEvent.change(requestTimeField, { target: { value: "2022-01-02T12:00" } });
    fireEvent.change(explanationField, { target: { value: "Tests pass locally but fail on Gradescope." } });
    // If solved is a checkbox, prefer click to set true:
    // fireEvent.click(solvedField);
    fireEvent.change(solvedField, { target: { value: true } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/Requester Email must be a valid email address\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Team Id must be a number\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Table Or Breakout Room must be a number\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Explanation must be at most 250 characters\./)).not.toBeInTheDocument();

    expect(screen.queryByText(/Requester Email is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Team Id is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Table Or Breakout Room is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Request Time is required\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Explanation is required\./)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-cancel");
    const cancelButton = screen.getByTestId("HelpRequestForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  //
  // ===== Added tests to kill Stryker survivors =====
  //

  test("initialContents pre-populates ALL fields via defaultValues (including checkbox)", async () => {
    const one = {
      ...helpRequestFixtures.oneHelpRequest,
      requestTime: helpRequestFixtures.oneHelpRequest.requestTime.slice(0, 16),
      explanation: "no access to GitHub.",
      solved: false,
    };

    render(
      <Router>
        <HelpRequestForm initialContents={one} />
      </Router>
    );

    expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveDisplayValue(one.requesterEmail);
    expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveDisplayValue(one.teamId);
    expect(screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom")).toHaveDisplayValue(one.tableOrBreakoutRoom);
    expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveDisplayValue(one.requestTime);
    expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveDisplayValue(one.explanation);
    expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();
    expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue(String(one.id));
  });

  test("email rejects leading/trailing junk (anchors ^ $ enforced)", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>
    );

    // trailing junk
    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), { target: { value: "student@ucsb.edu extra" } });
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));
    await screen.findByText(/Requester Email must be a valid email address\./);

    // leading junk
    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), { target: { value: "xx student@ucsb.edu" } });
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));
    await screen.findByText(/Requester Email must be a valid email address\./);
  });

  test("teamId and tableOrBreakoutRoom must be digits only (no prefix/suffix)", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>
    );

    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), { target: { value: "16a" } });
    fireEvent.change(screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"), { target: { value: "a16" } });
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await screen.findByText(/Team Id must be a number\./);
    expect(screen.getByText(/Table Or Breakout Room must be a number\./)).toBeInTheDocument();
  });

  test("requestTime enforces strict pattern: YYYY-MM-DDTHH:mm with optional :ss and .sss", async () => {
    render(
      <Router>
        {/* Pass a noop so handleSubmit(onValid) is always a function */}
        <HelpRequestForm submitAction={noop} />
      </Router>
    );

    // Make all OTHER fields valid so only requestTime controls this error
    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
      target: { value: "ok@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Fine." },
    });

    const submit = () => fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));
    const setRT = (val) =>
      fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
        target: { value: val },
      });

    // --- invalid cases (should show "Request Time is required.")
    setRT("202-10-31T13:30"); // wrong year width
    submit();
    await screen.findByText(/Request Time is required\./);

    setRT("2025-10-31T13:30:7a"); // non-digits in seconds
    submit();
    await screen.findByText(/Request Time is required\./);

    setRT("2025-10-31T13:30:.123"); // millis without seconds
    submit();
    await screen.findByText(/Request Time is required\./);

    setRT("2025-10-31T13:30:45.ABC"); // non-digits in millis
    submit();
    await screen.findByText(/Request Time is required\./);

    // --- valid cases (error should DISAPPEAR)
    setRT("2025-10-31T13:30");
    submit();
    await waitFor(() =>
      expect(screen.queryByText(/Request Time is required\./)).not.toBeInTheDocument()
    );

    setRT("2025-10-31T13:30:45");
    submit();
    await waitFor(() =>
      expect(screen.queryByText(/Request Time is required\./)).not.toBeInTheDocument()
    );

    setRT("2025-10-31T13:30:45.123");
    submit();
    await waitFor(() =>
      expect(screen.queryByText(/Request Time is required\./)).not.toBeInTheDocument()
    );
  });
});
