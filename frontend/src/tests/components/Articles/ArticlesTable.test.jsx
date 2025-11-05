import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import ArticlesTable from "main/components/Articles/ArticlesTable";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "id",
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added",
  ];
  const expectedFields = [
    "id",
    "title",
    "url",
    "explanation",
    "email",
    "dateAdded",
  ];
  const testId = "ArticlesTable";

  test("renders empty table correctly", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable articles={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      String(articlesFixtures.threeArticles[0].id),
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-title`),
    ).toHaveTextContent(articlesFixtures.threeArticles[0].title);

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      String(articlesFixtures.threeArticles[1].id),
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-title`),
    ).toHaveTextContent(articlesFixtures.threeArticles[1].title);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const firstId = String(articlesFixtures.threeArticles[0].id);
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent(firstId);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(`/articles/edit/${firstId}`),
    );
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/articles")
      .reply(200, { message: "Article deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const firstId = articlesFixtures.threeArticles[0].id;
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent(String(firstId));

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/articles");
    expect(axiosMock.history.delete[0].params).toEqual({ id: firstId });
  });
});
