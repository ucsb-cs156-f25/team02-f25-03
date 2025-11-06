import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { organizationFixtures } from "fixtures/organizationFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganization tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );
    await screen.findByText(/Organization Short Translation/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Organization Short Translation/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a UCSBOrganization", async () => {
    render(
      <Router>
        <UCSBOrganizationForm initialContents={organizationFixtures.oneOrganization[0]} />
      </Router>,
    );
    await screen.findByTestId(/UCSBOrganizationForm-orgCode/);
    expect(screen.getByText(/Organization Code/)).toBeInTheDocument();
    expect(screen.getByTestId(/UCSBOrganizationForm-orgCode/)).toHaveValue("pog");
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );
    await screen.findByTestId("UCSBOrganizationForm-submit");
    const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Organization Short Translation is required./);
    expect(screen.getByText(/Organization Translation is required./)).toBeInTheDocument();
  });

  test("Correct Error messsages on too large input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("UCSBOrganizationForm-orgTranslationShort");

    const orgTranslationShortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
    const orgTranslationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
    const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

    fireEvent.change(orgTranslationShortField, { target: { value: "UCSBOrganizationForm-orgTranslationTOOOOOOOOOOOOLOOOOOOOOONNNGGG" } });
    fireEvent.change(orgTranslationField, { target: { value: "UCSBOrganizationForm-orgTranslationWAAAAAAAAAAAAAAYYYYTOOOOOOOOOOOOLOOOOOOOOONNNGGG" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Max length 50 characters/);
    expect(screen.getByText(/Max length 75 characters/)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("UCSBOrganizationForm-orgTranslationShort");

    const orgTranslationShortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
    const orgTranslationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
    const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
    const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

    fireEvent.change(orgTranslationShortField, { target: { value: "Game Dev Club" } });
    fireEvent.change(orgTranslationField, { target: { value: "Game Development Club" } });
    fireEvent.change(inactiveField, {
      target: { value: "false" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Organization Translation Short is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Organization Translation is required./),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );
    await screen.findByTestId("UCSBOrganizationForm-cancel");
    const cancelButton = screen.getByTestId("UCSBOrganizationForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
