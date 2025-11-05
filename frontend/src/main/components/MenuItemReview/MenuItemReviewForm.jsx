import { Button, Form} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function MenuItemReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  // Stryker disable next-line all
  const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // imperfect validation but ok enough

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
        {initialContents && (
            <Form.Group className="mb-3">
            <Form.Label htmlFor="id">Id</Form.Label>
            <Form.Control
                data-testid={"MenuItemReviewForm-id"}
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
            />
            </Form.Group>
        )}

        <Form.Group className="mb-3">
            <Form.Label htmlFor="itemId">Item Id</Form.Label>
            <Form.Control
                data-testid="MenuItemReviewForm-itemId"
                id="itemId"
                type="number"
                isInvalid={Boolean(errors.itemId)}
                {...register("itemId", {
                    required: true
                })}
            />
            <Form.Control.Feedback type="invalid">
                {errors.itemId && "ItemId is required. "}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label htmlFor="reviewerEmail">Reviewer Email</Form.Label>
            <Form.Control
                data-testid="MenuItemReviewForm-reviewerEmail"
                id="reviewerEmail"
                type="text"
                isInvalid={Boolean(errors.reviewerEmail)}
                {...register("reviewerEmail", {
                    required: true,
                    pattern: email_regex
                })}
            />
            <Form.Control.Feedback type="invalid">
                {errors.reviewerEmail && "ReviewerEmail is required. "}
                {errors.reviewerEmail?.type === "pattern" &&
                    "ReviewerEmail must be a valid email."}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label htmlFor="stars">Stars</Form.Label>
            <Form.Control
                data-testid="MenuItemReviewForm-stars"
                id="stars"
                type="number"
                isInvalid={Boolean(errors.stars)}
                {...register("stars", {
                    required: true,
                    min: 1,
                    max: 5
                })}
            />
            <Form.Control.Feedback type="invalid">
                {errors.stars && "Stars is required. "}
                {errors.stars?.type === "min" && "Stars must be at least 1."}
                {errors.stars?.type === "max" && "Stars must be at most 5."}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label htmlFor="dateReviewed">Date (ISO format)</Form.Label>
            <Form.Control
                data-testid="MenuItemReviewForm-dateReviewed"
                id="dateReviewed"
                type="datetime-local"
                isInvalid={Boolean(errors.dateReviewed)}
                {...register("dateReviewed", {
                    required: true,
                    pattern: isodate_regex
                })}
            />
            <Form.Control.Feedback type="invalid">
                {errors.dateReviewed && "DateReviewed is required. "}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label htmlFor="comments">Comments</Form.Label>
            <Form.Control
                data-testid="MenuItemReviewForm-comments"
                id="comments"
                type="text"
                isInvalid={Boolean(errors.comments)}
                {...register("comments", {
                    // not required for easier/shorter reviews that don't need fully written comments
                })}
            />
            <Form.Control.Feedback type="invalid">
                {errors.comments}
            </Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" data-testid="MenuItemReviewForm-submit">
            {buttonLabel}
        </Button>
        <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="MenuItemReviewForm-cancel"
        >
            Cancel
        </Button>
    </Form>
  );
}

export default MenuItemReviewForm;
