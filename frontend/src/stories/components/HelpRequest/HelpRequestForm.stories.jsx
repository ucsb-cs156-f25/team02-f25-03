import React from "react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { MemoryRouter } from "react-router";

export default {
  title: "components/HelpRequest/HelpRequestForm",
  component: HelpRequestForm,
  parameters: { layout: "centered" },

};

const Template = (args) => <HelpRequestForm {...args} />;

export const Create = Template.bind({});
Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data:", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const EditExistingHelpRequest = Template.bind({});
EditExistingHelpRequest.args = {
  initialContents: helpRequestFixtures.oneHelpRequest,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data:", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
