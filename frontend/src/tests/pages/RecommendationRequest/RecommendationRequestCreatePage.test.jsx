import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 17,
      requesterEmail: "johndoe@ucsb.edu",
      professorEmail: "profconrad@ucsb.edu",
      explanation: "pls give letter for masters apps",
      dateRequested: "2025-11-04T12:00",
      dateNeeded: "2025-11-05T11:59",
      done: false
    };

    axiosMock.onPost("/api/recommendationrequest/post").reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    const requesterEmailField = screen.getByTestId("RecommendationRequestForm-requesterEmail");
    const professorEmailField = screen.getByTestId("RecommendationRequestForm-professorEmail");
    const explanationField = screen.getByTestId("RecommendationRequestForm-explanation");
    const dateRequestedField = screen.getByTestId("RecommendationRequestForm-dateRequested");
    const dateNeededField = screen.getByTestId("RecommendationRequestForm-dateNeeded");
    const doneField = screen.getByTestId("RecommendationRequestForm-done")
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "johndoe@ucsb.edu" } });
    fireEvent.change(professorEmailField, { target: { value: "profconrad@ucsb.edu" } });
    fireEvent.change(explanationField, { target: { value: "pls give letter for masters apps" } });
    fireEvent.change(dateRequestedField, { target: { value: "2025-11-04T12:00:00" } });
    fireEvent.change(dateNeededField, { target: { value: "2025-11-05T11:59:00" } });
    fireEvent.change(doneField, { target : { value: false } })

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "johndoe@ucsb.edu",
      professorEmail: "profconrad@ucsb.edu",
      explanation: "pls give letter for masters apps",
      dateRequested: "2025-11-04T12:00",
      dateNeeded: "2025-11-05T11:59",
      done: false
    });

    expect(mockToast).toBeCalledWith(
      "New RecommendationRequest Created - id: 17 requesterEmail: johndoe@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });
  });
});
