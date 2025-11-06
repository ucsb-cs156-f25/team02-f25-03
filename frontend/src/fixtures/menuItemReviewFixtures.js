const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "johnsmith@ucsb.edu",
    stars: 5,
    dateReviewed: "2025-10-30T12:00:00",
    comments: "Tasty! Would eat again",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "johnsmith@ucsb.edu",
      stars: 5,
      dateReviewed: "2025-10-30T12:00:00",
      comments: "Tasty! Would eat again",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "janedoe@ucsb.edu",
      stars: 1,
      dateReviewed: "2025-10-31T15:00:00",
      comments: "disgusting",
    },
    {
      id: 3,
      itemId: 2,
      reviewerEmail: "henryyang@ucsb.edu",
      stars: 3,
      dateReviewed: "2025-11-01T08:00:00",
      comments: "mid...",
    },
  ],
};

export { menuItemReviewFixtures };
