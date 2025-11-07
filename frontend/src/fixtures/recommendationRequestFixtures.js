const recommendationRequestFixtures = {
  oneRequest: [
    {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    professorEmail: "prof1@ucsb.edu",
    explanation: "Grad school recommendation",
    dateRequested: "2025-11-04T04:58:52.791Z",
    dateNeeded: "2025-12-01T04:58:52.791Z",
    done: false,
    },
  ],
  threeRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      professorEmail: "prof1@ucsb.edu",
      explanation: "Grad school recommendation",
      dateRequested: "2025-11-04T04:58:52.791Z",
      dateNeeded: "2025-12-01T04:58:52.791Z",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      professorEmail: "prof2@ucsb.edu",
      explanation: "Scholarship reference",
      dateRequested: "2025-11-05T04:58:52.791Z",
      dateNeeded: "2025-12-10T04:58:52.791Z",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      professorEmail: "prof3@ucsb.edu",
      explanation: "Job recommendation",
      dateRequested: "2025-11-06T04:58:52.791Z",
      dateNeeded: "2025-12-15T04:58:52.791Z",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
