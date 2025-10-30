export const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student@ucsb.edu",
    teamId: "t01",
    tableOrBreakoutRoom: "Table 5",
    requestTime: "2025-10-30T12:00:00",
    explanation: "no access to GitHub.",
    solved: false
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "test1@ucsb.edu",
      teamId: "t01",
      tableOrBreakoutRoom: "Breakout Room 1",
      requestTime: "2025-10-29T14:20:00",
      explanation: "need help debugging Maven build issues.",
      solved: false
    },
    {
      id: 2,
      requesterEmail: "test2@ucsb.edu",
      teamId: "t02",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2025-10-28T15:45:00",
      explanation: "mvn run IT failed after 10 min.",
      solved: true
    },
    {
      id: 3,
      requesterEmail: "test3@ucsb.edu",
      teamId: "t3",
      tableOrBreakoutRoom: "Breakout Room 3",
      requestTime: "2025-10-27T09:30:00",
      explanation: "unable to login",
      solved: false
    }
  ]
};
