import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { normalizeDateTime } from "main/utils/dateUtils";

export default function ArticlesEditPage({ storybook = false }) {
  // 取路由 id
  const { id } = useParams();

  // 读取当前要编辑的 Article
  const {
    data: article,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/articles?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: "/api/articles",
      params: { id },
    }
  );

  // PUT 参数构造（注意把 dateAdded 规范成 T00:00:00）
  const objectToAxiosPutParams = (a) => ({
    url: "/api/articles",
    method: "PUT",
    params: { id: a.id },
    data: {
      title: a.title,
      url: a.url,
      explanation: a.explanation,
      email: a.email,
      dateAdded: normalizeDateTime(a.dateAdded),
    },
  });

  const onSuccess = (a) => {
    toast(`Article Updated - id: ${a.id} title: ${a.title}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/articles?id=${id}`]
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Article</h1>
        {article && (
          <ArticlesForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={article}
          />
        )}
      </div>
    </BasicLayout>
  );
}
