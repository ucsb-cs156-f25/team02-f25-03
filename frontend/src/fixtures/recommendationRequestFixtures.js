const recommendationRequestFixtures = {
  oneRequest: {
    id: 1,
    requesterEmail: "johndoe@ucsb.edu",
    professorEmail: "profsmith@ucsb.edu",
    explanation: "pls give letters for masters apps",
    dateRequested: "2025-11-04T08:00:00",
    dateNeeded: "2025-11-05T05:00:00",
    done: true
  },
  threeRequests: [
    {
      id: 1,
      requesterEmail: "johndoe@ucsb.edu",
      professorEmail: "profsmith@ucsb.edu",
      explanation: "pls give letters for masters apps",
      dateRequested: "2025-11-04T08:00:00",
      dateNeeded: "2025-11-05T05:00:00",
      done: true
    },
    {
      id: 2,
      requesterEmail: "janedoe@ucsb.edu",
      professorEmail: "profjones@ucsb.edu",
      explanation: "Letter of rec needed for PhD applications. Deadline is Dec 1st.",
      dateRequested: "2025-11-05T10:30:00",
      dateNeeded: "2025-12-01T08:00:00",
      done: false
    },
    {
      id: 3,
      requesterEmail: "alexrivera@ucsb.edu",
      professorEmail: "profsmith@ucsb.edu",
      explanation: "Following up on request for internship recommendation letter.",
      dateRequested: "2025-11-01T14:00:00",
      dateNeeded: "2025-11-15T23:59:59",
      done: false
    }
  ]
};

export { recommendationRequestFixtures };