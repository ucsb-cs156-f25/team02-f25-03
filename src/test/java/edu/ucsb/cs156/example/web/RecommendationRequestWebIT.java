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
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_recommendationrequest() throws Exception {
    setupUser(true); // admin

    // navigate to page
    page.getByText("Recommendation Request").click();

    // create
    page.getByText("Create Recommendation Request").click();
    assertThat(page.getByText("Create New RecommendationRequest")).isVisible();

    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("prof@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Applying to grad school");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2025-11-05T12:00");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2025-11-30T12:00");

    page.getByTestId("RecommendationRequestForm-submit").click();

    // check created row
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student@ucsb.edu");

    // edit
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit RecommendationRequest")).isVisible();

    page.getByTestId("RecommendationRequestForm-explanation").fill("Updated explanation");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("Updated explanation");

    // delete
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendationrequest() throws Exception {
    setupUser(false); // regular user

    page.getByText("Recommendation Request").click();

    // they should NOT see create button
    assertThat(page.getByText("Create Recommendation Request")).not().isVisible();

    // they should not see rows
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }
}
