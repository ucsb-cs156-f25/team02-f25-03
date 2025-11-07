import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { normalizeDateTime } from "main/utils/dateUtils";

export default function ArticlesCreatePage({ storybook = false }) {
  const objectToAxiosParams = (article) => ({
    url: "/api/articles/post",
    method: "POST",
    params: {
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: normalizeDateTime(article.dateAdded),
    },
  });

  const onSuccess = (article) => {
    toast(`New article Created - id: ${article.id} title: ${article.title}`);
  };

  // Stryker disable next-line all : hard to set up test for caching
  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [ "/api/articles/all",]);

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
        <h1>Create New Article</h1>
        <ArticlesForm submitAction={onSubmit} buttonLabel="Create" />
      </div>
    </BasicLayout>
  );
}
