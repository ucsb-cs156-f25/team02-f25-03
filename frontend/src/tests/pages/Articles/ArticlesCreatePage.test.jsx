import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesCreatePage, {
  normalizeDateTime,
} from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 7,
      title: "How to test React forms",
      url: "https://example.com/how-to-test",
      explanation: "Step-by-step guide",
      email: "alice@test.edu",
      dateAdded: "2024-10-31",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const urlInput = screen.getByLabelText("URL");
    const explanationInput = screen.getByLabelText("Explanation");
    const emailInput = screen.getByLabelText("Email");
    const dateInput = screen.getByLabelText("Date Added");
    const createButton = screen.getByText("Create");

    fireEvent.change(titleInput, {
      target: { value: "How to test React forms" },
    });
    fireEvent.change(urlInput, {
      target: { value: "https://example.com/how-to-test" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "Step-by-step guide" },
    });
    fireEvent.change(emailInput, { target: { value: "alice@test.edu" } });
    fireEvent.change(dateInput, { target: { value: "2024-10-31" } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toMatchObject({
      title: "How to test React forms",
      url: "https://example.com/how-to-test",
      explanation: "Step-by-step guide",
      email: "alice@test.edu",
    });

    expect(axiosMock.history.post[0].params.dateAdded).toBe(
      "2024-10-31T00:00:00",
    );

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 7 title: How to test React forms",
    );

    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  describe("normalizeDateTime", () => {
    test("returns v when v is falsy", () => {
      expect(normalizeDateTime("")).toBe("");
      expect(normalizeDateTime(undefined)).toBeUndefined();
      expect(normalizeDateTime(null)).toBeNull();
    });

    test("adds T00:00:00 for YYYY-MM-DD", () => {
      expect(normalizeDateTime("2024-10-31")).toBe("2024-10-31T00:00:00");
    });

    test("keeps original when already has time", () => {
      expect(normalizeDateTime("2024-10-31T12:34:56")).toBe(
        "2024-10-31T12:34:56",
      );
    });
  });

  describe("normalizeDateTime", () => {
    test("returns v when v is falsy (undefined/null/empty string)", () => {
      expect(normalizeDateTime(undefined)).toBeUndefined();
      expect(normalizeDateTime(null)).toBeNull();
      expect(normalizeDateTime("")).toBe("");
    });

    test("adds T00:00:00 only for YYYY-MM-DD (with dashes)", () => {
      expect(normalizeDateTime("2024-10-31")).toBe("2024-10-31T00:00:00");
      expect(normalizeDateTime("2024/10/31")).toBe("2024/10/31");
      expect(normalizeDateTime("2024-1-31")).toBe("2024-1-31");
      expect(normalizeDateTime("2024-10-3")).toBe("2024-10-3");
      expect(normalizeDateTime("20241031")).toBe("20241031");
    });

    test("keeps original when there is already a time part", () => {
      expect(normalizeDateTime("2024-10-31T12:34:56")).toBe(
        "2024-10-31T12:34:56",
      );
      expect(normalizeDateTime("2024-10-31 12:34:56")).toBe(
        "2024-10-31 12:34:56",
      );
    });
    test("does NOT add time when there is trailing chars", () => {
      expect(normalizeDateTime("2024-10-31x")).toBe("2024-10-31x");
      expect(normalizeDateTime("2024-10-31-01")).toBe("2024-10-31-01");
      expect(normalizeDateTime("2024-10-31 ")).toBe("2024-10-31 ");
    });

    test("does NOT add time when there is leading chars", () => {
      expect(normalizeDateTime("x2024-10-31")).toBe("x2024-10-31");
      expect(normalizeDateTime(" 2024-10-31")).toBe(" 2024-10-31");
    });

    test("does NOT add time for slash or compact formats", () => {
      expect(normalizeDateTime("2024/10/31")).toBe("2024/10/31");
      expect(normalizeDateTime("20241031")).toBe("20241031");
    });

    test("keeps original when time part already present", () => {
      expect(normalizeDateTime("2024-10-31T12:34:56")).toBe(
        "2024-10-31T12:34:56",
      );
    });
  });
});
