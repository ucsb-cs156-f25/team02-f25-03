import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/articleUtils";

// mock react-toastify 的 toast 函数
vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

import { toast } from "react-toastify";

describe("articleUtils", () => {
  test("cellToAxiosParamsDelete returns correct axios params", () => {
    const cell = { row: { original: { id: 42 }, values: { id: 42 } } };
    const params = cellToAxiosParamsDelete(cell);
    expect(params).toEqual({
      url: "/api/articles",
      method: "DELETE",
      params: { id: 42 },
    });
  });

  test("onDeleteSuccess calls toast with message", () => {
    const msg = { message: "Article deleted" };
    onDeleteSuccess(msg);
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(msg);
  });
});
