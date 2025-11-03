import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function HelpRequestForm({
  initialContents,
  submitAction = () => {},
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();
  const testIdPrefix = "HelpRequestForm";
  const idRegex = /^\d+$/;  
  const emailRegex = /[^\s@]@[^\s@]+\.[^\s@]+$/i;
  // Stryker disable next-line regex : don't test regex
  const isoLocalRegex = /(\d-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)(:[0-5]\D(\.\D))?/i;

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid={testIdPrefix + "-id"}
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col md={5}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-requesterEmail"}
              id="requesterEmail"
              type="text"
              placeholder="e.g. student@ucsb.edu"
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

        <Col md={5}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team Id</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-teamId"}
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
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">
              Table Or Breakout Room
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-tableOrBreakoutRoom"}
              id="tableOrBreakoutRoom"
              type="text"
              placeholder="e.g. 07"
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

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">
              Request Time (ISO Format)
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-requestTime"}
              id="requestTime"
              type="datetime-local"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: "Request Time is required.",
                pattern: { },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          data-testid={testIdPrefix + "-explanation"}
          id="explanation"
          placeholder="Briefly describe the issue…"
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            maxLength: {
              value: 250,
              message: "Explanation must be at most 250 characters.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="solved">
        <Form.Check
          type="checkbox"
          label="Solved"
          data-testid={testIdPrefix + "-solved"}
          {...register("solved")}
        />
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
        className="ms-2"
      >
        Cancel
      </Button>
    </Form>
  );
}

export default HelpRequestForm;
