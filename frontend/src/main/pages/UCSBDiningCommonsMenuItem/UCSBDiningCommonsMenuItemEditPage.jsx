import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: ucsbdiningcommonsmenuitem,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsbdiningcommonsmenuitem?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/ucsbdiningcommonsmenuitem`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (ucsbdiningcommonsmenuitem) => ({
    url: "/api/ucsbdiningcommonsmenuitem",
    method: "PUT",
    params: {
      id: ucsbdiningcommonsmenuitem.id,
    },
    data: {
      diningCommonsCode: ucsbdiningcommonsmenuitem.diningCommonsCode,
      name: ucsbdiningcommonsmenuitem.name,
      station: ucsbdiningcommonsmenuitem.station,
    },
  });

  const onSuccess = (ucsbdiningcommonsmenuitem) => {
    toast(`UCSBDiningCommonsMenuItem Updated - id: ${ucsbdiningcommonsmenuitem.id} name: ${ucsbdiningcommonsmenuitem.name}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/ucsbdiningcommonsmenuitem?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/diningcommonsmenuitem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSBDiningCommonsMenuItem</h1>
        {ucsbdiningcommonsmenuitem && (
          <UCSBDiningCommonsMenuItemForm
            initialContents={ucsbdiningcommonsmenuitem}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}

