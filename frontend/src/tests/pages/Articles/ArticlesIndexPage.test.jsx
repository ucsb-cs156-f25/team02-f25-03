import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ArticlesIndexPage from "main/pages/Articles/ArticlesIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { articlesFixtures } from "fixtures/articlesFixtures";

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

describe("ArticleIndexPage tests", () => {
  let axiosMock;                // ★ 改成 let，并在 beforeEach new
  let queryClient;              // ★ 每个用例一个新的 QueryClient

  // ★ 这里改成和组件一致的前缀
  const testId = "ArticlesTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);                        // ★
    queryClient = new QueryClient({                                 // ★
      defaultOptions: { queries: { retry: false, cacheTime: 0, staleTime: 0 } },
    });
  });

  afterEach(() => {
    axiosMock.restore();
    queryClient.clear();                                            // ★
    mockToast.mockClear();
  });

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/articles/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Create Article/i)).toBeInTheDocument();
    });
    const link = screen.getByText(/Create Article/i);
    expect(link).toHaveAttribute("href", "/articles/create");
    // ★ 用 toHaveStyle 更稳健（Stryker 的 object literal 变异也能被杀掉）
    expect(link).toHaveStyle("float: right");
  });

  test("renders three articles correctly for regular user", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/articles/all").reply(200, articlesFixtures.threeArticles);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("3");
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent("4");

    // 非管理员不应出现 Create Article
    expect(screen.queryByText(/Create Article/i)).not.toBeInTheDocument();

    // 下面这两条断言貌似是其他页面（Restaurants）的例子，若无此列请删除
    // const name = screen.getByText("Freebirds");
    // expect(name).toBeInTheDocument();
    // const description = screen.getByText("Burrito joint, and iconic Isla Vista location");
    // expect(description).toBeInTheDocument();

    expect(screen.queryByTestId("ArticlesTable-cell-row-0-col-Delete-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ArticlesTable-cell-row-0-col-Edit-button")).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/articles/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch("Error communicating with backend via GET on /api/articles/all");
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock.onGet("/api/articles/all").reply(200, articlesFixtures.threeArticles);
    axiosMock.onDelete("/api/articles").reply(200, "Article with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("2");

    const deleteButton = await screen.findByTestId(`${testId}-cell-row-0-col-Delete-button`);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("Article with id 1 was deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/articles");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });
});
