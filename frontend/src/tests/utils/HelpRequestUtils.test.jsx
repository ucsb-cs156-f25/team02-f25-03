import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/HelpRequestUtils";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("HelpRequestUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();
      onDeleteSuccess("abc");
      expect(console.log).toHaveBeenCalledWith("abc");
      expect(mockToast).toHaveBeenCalledWith("abc");
      restoreConsole();
    });
  });
  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct params", () => {
      const cell = { row: { values: { id: 17 } } };
      const result = cellToAxiosParamsDelete(cell);
      expect(result).toEqual({
        url: "/api/helprequests",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});
