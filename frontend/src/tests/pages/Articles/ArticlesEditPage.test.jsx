// 注意：确保此文件路径和文件名大小写与项目一致
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

// ---- toast mock ----
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, toast: vi.fn((x) => mockToast(x)) };
});

// ---- 只覆写 useParams / Navigate，保留其它导出（尤其是 MemoryRouter）----
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: 17 })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();

      axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);

      // GET /api/articles?id=17 超时
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("ArticlesForm-title")).not.toBeInTheDocument();

      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();

      axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);

      // 初始文章（dateAdded 为 YYYY-MM-DD，PUT 时应被规范为 T00:00:00）
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "How to write tests",
        url: "https://example.com/how-to-write-tests",
        explanation: "short note",
        email: "alice@test.edu",
        dateAdded: "2024-10-31T00:00:00",
      });

      // PUT 成功
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "How to write better tests",
        url: "https://example.com/how-to-write-tests",
        explanation: "longer note",
        email: "alice@test.edu",
        dateAdded: "2024-10-31T00:00:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided and sends PUT with normalized date", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("How to write tests");
      expect(urlField).toHaveValue("https://example.com/how-to-write-tests");
      expect(explanationField).toHaveValue("short note");
      expect(emailField).toHaveValue("alice@test.edu");
      expect(dateAddedField).toHaveValue("2024-10-31T00:00");
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, { target: { value: "How to write better tests" } });
      fireEvent.change(explanationField, { target: { value: "longer note" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());

      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: How to write better tests"
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "How to write better tests",
          url: "https://example.com/how-to-write-tests",
          explanation: "longer note",
          email: "alice@test.edu",
          dateAdded: "2024-10-31T00:00:00",
        })
      );
    });

    test("Changes when you click Update (smoke)", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("ArticlesForm-id");

      const titleField = screen.getByTestId("ArticlesForm-title");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(titleField).toHaveValue("How to write tests");
      expect(explanationField).toHaveValue("short note");

      fireEvent.change(titleField, { target: { value: "How to write better tests" } });
      fireEvent.change(explanationField, { target: { value: "longer note" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: How to write better tests"
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });
  });
});
