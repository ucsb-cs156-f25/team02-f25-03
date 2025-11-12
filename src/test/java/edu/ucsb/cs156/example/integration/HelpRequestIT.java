package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestIT {

  @Autowired public CurrentUserService currentUserService;
  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;
  @Autowired HelpRequestRepository helpRequestRepository;
  @Autowired public MockMvc mockMvc;
  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2025-11-10T16:17");

    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("tzz@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("01")
            .requestTime(ldt1)
            .explanation("test tzz")
            .solved(false)
            .build();

    helpRequestRepository.save(helpRequest);
    Long id = helpRequest.getId();

    MvcResult response =
        mockMvc
            .perform(get("/api/helprequest").param("id", String.valueOf(id)))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = mapper.writeValueAsString(helpRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_help_request() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2025-11-10T16:17");

    HelpRequest expected =
        HelpRequest.builder()
            .requesterEmail("integration@ucsb.edu")
            .teamId("02")
            .tableOrBreakoutRoom("02")
            .requestTime(ldt1)
            .explanation("new_integration")
            .solved(false)
            .build();

    MvcResult response =
        mockMvc
            .perform(
                post("/api/helprequest/post")
                    .with(csrf())
                    .param("requesterEmail", "integration@ucsb.edu")
                    .param("teamId", "02")
                    .param("tableOrBreakoutRoom", "02")
                    .param("requestTime", "2025-11-10T16:17:00")
                    .param("explanation", "new_integration")
                    .param("solved", "false"))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    HelpRequest actual = mapper.readValue(responseString, HelpRequest.class);

    expected.setId(actual.getId());
    String expectedJson = mapper.writeValueAsString(expected);
    assertEquals(expectedJson, responseString);
  }
}
