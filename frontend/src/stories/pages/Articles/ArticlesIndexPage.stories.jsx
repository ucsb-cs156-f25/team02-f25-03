// frontend/src/stories/pages/Articles/ArticlesIndexPage.stories.jsx
import React from "react";
import { http, HttpResponse } from "msw";
import ArticlesIndexPage from "main/pages/Articles/ArticlesIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { articlesFixtures } from "fixtures/articlesFixtures";

export default {
  title: "pages/Articles/ArticlesIndexPage",
  component: ArticlesIndexPage,
};

const Template = () => <ArticlesIndexPage />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/articles/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const ThreeArticlesOrdinaryUser = Template.bind({});
ThreeArticlesOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 })),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 })),
    http.get("/api/articles/all", () =>
      HttpResponse.json(articlesFixtures.threeArticles, { status: 200 })),
    http.delete("/api/articles", () => HttpResponse.json({}, { status: 200 })),
  ],
};

export const ThreeArticlesAdminUser = Template.bind({});

ThreeArticlesAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/articles/all", () => {
      return HttpResponse.json(articlesFixtures.threeArticles);
    }),
    http.delete("/api/articles", () => {
      return HttpResponse.json(
        { message: "Article deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
