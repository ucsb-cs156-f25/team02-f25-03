import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";
import { articlesFixtures } from "fixtures/articlesFixtures";

export default {
  title: "pages/Articles/ArticlesEditPage",
  component: ArticlesEditPage,
};

const Template = () => <ArticlesEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    // 当前用户信息
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),

    // 系统信息
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),

    // 模拟后端返回的单篇文章（用 fixtures 里的第一篇）
    http.get("/api/articles", () => {
      return HttpResponse.json(articlesFixtures.oneArticle, {
        status: 200,
      });
    }),

    // PUT 请求（更新文章）
    http.put("/api/articles", (req) => {
      window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
