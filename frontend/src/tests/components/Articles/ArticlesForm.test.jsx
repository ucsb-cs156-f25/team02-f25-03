import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added",
  ];
  const testId = "ArticlesForm";

  test("renders correctly with no initialContents", async () => {
     const submitAction = vi.fn();
       render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // no id field when creating
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm initialContents={articlesFixtures.oneArticle} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // id appears and is labeled
    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    // 触达这些 testids，避免 data-testid 相关 mutants 存活
    expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    expect(screen.getByTestId("ArticlesForm-url")).toBeInTheDocument();
    expect(screen.getByTestId("ArticlesForm-explanation")).toBeInTheDocument();
    expect(screen.getByTestId("ArticlesForm-email")).toBeInTheDocument();
    expect(screen.getByTestId("ArticlesForm-dateAdded")).toBeInTheDocument();
    expect(screen.getByTestId("ArticlesForm-submit")).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    const submitAction = vi.fn();
       render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
        const submitAction = vi.fn();
       render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = await screen.findByText(/Create/);
    fireEvent.click(submitButton);

    // required validations
    await screen.findByText(/Title is required/);
    expect(screen.getByText(/URL is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required/)).toBeInTheDocument();

    // title max length 100
    const titleInput = screen.getByTestId(`${testId}-title`);
    fireEvent.change(titleInput, { target: { value: "a".repeat(101) } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Max length 100 characters/)).toBeInTheDocument();
    });

    // url must start with http:// or https://
    const urlInput = screen.getByTestId(`${testId}-url`);
    fireEvent.change(urlInput, { target: { value: "invalid-url" } });
    fireEvent.click(submitButton);

    // email format
    const emailInput = screen.getByTestId(`${testId}-email`);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(submitButton);

    fireEvent.change(titleInput, { target: { value: "Good title" } });
    fireEvent.change(urlInput, {
      target: { value: "https://example.com/path" },
    });
    const explanationInput = screen.getByTestId("ArticlesForm-explanation");
    fireEvent.change(explanationInput, {
      target: { value: "a brief explanation" },
    });
    fireEvent.change(emailInput, { target: { value: "alice@test.edu" } });
    const dateInput = screen.getByTestId("ArticlesForm-dateAdded");
    fireEvent.change(dateInput, { target: { value: "2024-10-31" } }); // HTML date 的标准值
    fireEvent.click(submitButton);

    // 不应再出现任何错误信息（这里挑关键几条断言）
    await waitFor(() => {
      expect(
        screen.queryByText(/URL must start with http/),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Please enter a valid email address/),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Max length 100 characters/),
      ).not.toBeInTheDocument();
    });
  });
});
