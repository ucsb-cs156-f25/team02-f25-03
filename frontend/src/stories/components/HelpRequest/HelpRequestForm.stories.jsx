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

const renderForm = (args) => {
  return <HelpRequestForm {...args} />;
};

export const Create = renderForm.bind({});

Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const EditExistingHelpRequest = renderForm.bind({});

Update.args = {
  initialContents: helpRequestFixtures.oneHelpRequest,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};