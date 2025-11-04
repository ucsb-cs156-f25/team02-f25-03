import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function HelpRequestForm({
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
  // Stryker disable Regex
  const isoLocatRegex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  const idRegex = /^\d+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Stryker restore Regex

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="HelpRequestForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-requesterEmail"
              id="requesterEmail"
              type="text"
              placeholder="e.g. davidgaucho@ucsb.edu"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester Email is required.",
                pattern: {
                  value: emailRegex,
                  message: "Requester Email must be a valid email address.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team Id</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-teamId"
              id="teamId"
              type="text"
              placeholder="e.g. 04"
              isInvalid={Boolean(errors.teamId)}
              {...register("teamId", {
                required: "Team Id is required.",
                pattern: {
                  value: idRegex,
                  message: "Team Id must be a number.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.teamId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">
              Table Or Breakout Room
            </Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-tableOrBreakoutRoom"
              id="tableOrBreakoutRoom"
              type="text"
              placeholder="e.g. 04"
              isInvalid={Boolean(errors.tableOrBreakoutRoom)}
              {...register("tableOrBreakoutRoom", {
                required: "Table Or Breakout Room is required.",
                pattern: {
                  value: idRegex,
                  message: "Table Or Breakout Room must be a number.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tableOrBreakoutRoom?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">
              Request Time (ISO Format)
            </Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-requestTime"
              id="requestTime"
              type="datetime-local"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: true,
                pattern: isoLocatRegex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime && "Request Time is required."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-explanation"
              id="explanation"
              type="text"
              placeholder="e.g. Gradescope tests failing."
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: "Explanation is required.",
                maxLength: {
                  value: 255,
                  message: "Explanation must be at most 255 characters.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="solved">Solved</Form.Label>
            <Form.Check
              data-testid="HelpRequestForm-solved"
              id="solved"
              type="switch"
              isInvalid={Boolean(errors.solved)}
              {...register("solved")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="HelpRequestForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="HelpRequestForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default HelpRequestForm;