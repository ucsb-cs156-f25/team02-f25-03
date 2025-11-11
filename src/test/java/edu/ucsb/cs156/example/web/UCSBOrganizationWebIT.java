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
public class UCSBOrganizationWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_organization() throws Exception {
    setupUser(true);

    page.getByText("UCSB Organization").click();

    page.getByText("Create Organization").click();
    assertThat(page.getByText("Create New Organization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-orgCode").fill("GDC");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("Game Dev Club");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("Game Development Club");
    page.getByTestId("UCSBOrganizationForm-inactive").selectOption("true");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .hasText("Game Dev Club");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit UCSBOrganization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("THE BEST");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .hasText("THE BEST");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }
}
