import React from "react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestForm",
  component: HelpRequestForm,
  parameters: {
    layout: "centered",
  },
};

const renderForm = (args) => <HelpRequestForm {...args} />;

export const NewHelpRequest = {
  render: renderForm,
  args: {
    buttonLabel: "Create",
    submitAction: (formData) => {
      console.info("Form submitted:", formData);
      window.alert(`Submitted data:\n${JSON.stringify(formData, null, 2)}`);
    },
  },
};

export const EditExistingHelpRequest = {
  render: renderForm,
  args: {
    initialContents: {
      ...helpRequestFixtures.oneHelpRequest,
      requestTime:
        helpRequestFixtures.oneHelpRequest?.requestTime?.slice(0, 16) ??
        "2025-10-31T13:30",
    },
    buttonLabel: "Update",
    submitAction: (formData) => {
      console.info("Update triggered:", formData);
      window.alert(`Updated with data:\n${JSON.stringify(formData, null, 2)}`);
    },
  },
};
