package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleWebIT extends WebTestCase {

  @Test
  public void regular_user_cannot_create_article_and_sees_no_rows() throws Exception {

    setupUser(false);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).not().isVisible();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void admin_user_can_create_article() throws Exception {
    setupUser(true);

    page.getByText("Articles").click();

    page.getByText("Create Article").click();

    page.getByTestId("ArticlesForm-title").fill("Article1");
    page.getByTestId("ArticlesForm-url").fill("https://article1.com");
    page.getByTestId("ArticlesForm-explanation").fill("This is the explanation for article #1.");
    page.getByTestId("ArticlesForm-email").fill("article1@email.com");

    page.getByTestId("ArticlesForm-dateAdded").fill("2025-10-27T13:45");

    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Article1");
  }
}
