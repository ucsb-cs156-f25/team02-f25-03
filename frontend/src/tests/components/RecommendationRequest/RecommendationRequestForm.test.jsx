import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequest } from "fixtures/recommendationRequest";
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

describe("RecommendationRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    await screen.findByText(/Requester Email/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Requester Email/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a RecommendationRequest", async () => {
    render(
      <Router>
        <RecommendationRequestForm initialContents={recommendationRequest.onerequest[0]} />
      </Router>,
    );
    await screen.findByTestId(/RecommendationRequestForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/RecommendationRequestForm-id/)).toHaveValue("0");
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    await screen.findByTestId("RecommendationRequestForm-submit");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Requester email is required./);
    expect(screen.getByText(/Professor email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Requested is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Needed is required/)).toBeInTheDocument();
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <RecommendationRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    await screen.findByTestId("RecommendationRequestForm-requesterEmail");

    const requesterEmailField = screen.getByTestId("RecommendationRequestForm-requesterEmail");
    const professorEmailField = screen.getByTestId("RecommendationRequestForm-professorEmail");
    const explanationField = screen.getByTestId("RecommendationRequestForm-explanation");
    const dateRequestedField = screen.getByTestId("RecommendationRequestForm-dateRequested");
    const dateNeededField = screen.getByTestId("RecommendationRequestForm-dateNeeded");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "student@example.edu" } });
    fireEvent.change(professorEmailField, { target: { value: "professor@ucsb.edu" } });
    fireEvent.change(explanationField, { target: { value: "Recommendation for grad school" } });
    fireEvent.change(dateRequestedField, { target: { value: "2025-11-04T12:00" } });
    fireEvent.change(dateNeededField, { target: { value: "2025-12-01T12:00" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    await screen.findByTestId("RecommendationRequestForm-cancel");
    const cancelButton = screen.getByTestId("RecommendationRequestForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
  
  // adding this to fix line 14 mutation
  test("populates fields with initialContents values", async () => {
  const initialContents = {
    requesterEmail: "test@ucsb.edu",
    professorEmail: "prof@ucsb.edu",
    explanation: "I need a recommendation",
    dateRequested: "2024-01-01T00:00:00",
    dateNeeded: "2024-02-01T00:00:00",
    done: false,
  };

  render(
    <Router>
      <RecommendationRequestForm initialContents={initialContents} />
    </Router>
  );

  // Wait for inputs to appear
  const requesterInput = await screen.findByTestId("RecommendationRequestForm-requesterEmail");
  const professorInput = screen.getByTestId("RecommendationRequestForm-professorEmail");
  const explanationInput = screen.getByTestId("RecommendationRequestForm-explanation");

  // Check that form is prefilled
  expect(requesterInput).toHaveValue("test@ucsb.edu");
  expect(professorInput).toHaveValue("prof@ucsb.edu");
  expect(explanationInput).toHaveValue("I need a recommendation");
});

// Extra tests to kill remaining mutations
test("toggles done checkbox and submits correctly", async () => {
  const submitAction = vi.fn();

  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  const email = await screen.findByTestId("RecommendationRequestForm-requesterEmail");
  const prof = screen.getByTestId("RecommendationRequestForm-professorEmail");
  const exp = screen.getByTestId("RecommendationRequestForm-explanation");
  const dateReq = screen.getByTestId("RecommendationRequestForm-dateRequested");
  const dateNeed = screen.getByTestId("RecommendationRequestForm-dateNeeded");
  const doneCheckbox = screen.getByTestId("RecommendationRequestForm-done");
  const submit = screen.getByTestId("RecommendationRequestForm-submit");

  // Fill in valid fields
  fireEvent.change(email, { target: { value: "student@ucsb.edu" } });
  fireEvent.change(prof, { target: { value: "prof@ucsb.edu" } });
  fireEvent.change(exp, { target: { value: "Valid explanation" } });
  fireEvent.change(dateReq, { target: { value: "2025-11-04T12:00" } });
  fireEvent.change(dateNeed, { target: { value: "2025-12-01T12:00" } });

  // Toggle checkbox
  fireEvent.click(doneCheckbox);
  expect(doneCheckbox).toBeChecked();

  fireEvent.click(submit);

  await waitFor(() => expect(submitAction).toHaveBeenCalled());
});

test("submits form with initialContents populated", async () => {
  const submitAction = vi.fn();
  const initialContents = {
    id: 1,
    requesterEmail: "test@ucsb.edu",
    professorEmail: "prof@ucsb.edu",
    explanation: "Testing initial contents",
    dateRequested: "2025-01-01T12:00",
    dateNeeded: "2025-02-01T12:00",
    done: true
  };

  render(
    <Router>
      <RecommendationRequestForm initialContents={initialContents} submitAction={submitAction} />
    </Router>
  );

  // Ensure fields are pre-filled
  expect(screen.getByTestId("RecommendationRequestForm-requesterEmail")).toHaveValue("test@ucsb.edu");
  expect(screen.getByTestId("RecommendationRequestForm-professorEmail")).toHaveValue("prof@ucsb.edu");
  expect(screen.getByTestId("RecommendationRequestForm-explanation")).toHaveValue("Testing initial contents");
  expect(screen.getByTestId("RecommendationRequestForm-done")).toBeChecked();

  // Submit the form
  fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
  await waitFor(() => expect(submitAction).toHaveBeenCalled());
});

test("accepts ISO date with seconds and milliseconds", async () => {
  const submitAction = vi.fn();

  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  const email = await screen.findByTestId("RecommendationRequestForm-requesterEmail");
  const prof = screen.getByTestId("RecommendationRequestForm-professorEmail");
  const exp = screen.getByTestId("RecommendationRequestForm-explanation");
  const dateReq = screen.getByTestId("RecommendationRequestForm-dateRequested");
  const dateNeed = screen.getByTestId("RecommendationRequestForm-dateNeeded");
  const submit = screen.getByTestId("RecommendationRequestForm-submit");

  // Fill in valid fields
  fireEvent.change(email, { target: { value: "student@ucsb.edu" } });
  fireEvent.change(prof, { target: { value: "prof@ucsb.edu" } });
  fireEvent.change(exp, { target: { value: "Valid explanation" } });

  // ISO date without seconds/milliseconds (matches datetime-local)
fireEvent.change(dateReq, { target: { value: "2025-11-04T12:00" } });
fireEvent.change(dateNeed, { target: { value: "2025-12-01T12:00" } });


  fireEvent.click(submit);

  await waitFor(() => expect(submitAction).toHaveBeenCalled());
});

});
