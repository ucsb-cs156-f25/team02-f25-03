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
});
