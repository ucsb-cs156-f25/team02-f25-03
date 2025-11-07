import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/RecommendationRequestUtils";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("RecommendationRequestUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It logs the message and shows a toast", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess("Request deleted");

      // assert
      expect(mockToast).toHaveBeenCalledWith("Request deleted");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("Request deleted");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct axios params", () => {
      // arrange
      const cell = { row: { original: { id: 42 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/recommendationrequest",
        method: "DELETE",
        params: { id: 42 },
      });
    });
  });
});
