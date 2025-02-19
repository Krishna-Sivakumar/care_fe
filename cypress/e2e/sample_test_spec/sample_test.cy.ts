import { cy, describe, before, beforeEach, it, afterEach } from "local-cypress";

describe("Sample List", () => {
  before(() => {
    cy.loginByApi("devdistrictadmin", "Coronasafe@123");
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.awaitUrl("/");
    cy.get("a").contains("Sample Test").click();
  });

  it("Search by District name", () => {
    cy.get("[placeholder='District Name']").type("TEst").wait(1000);
    cy.url().should("include", "TEst");
  });

  it("Search by Patient Name", () => {
    cy.get("[placeholder='Search by Patient Name']").type("Test").wait(1000);
    cy.url().should("include", "Test");
  });

  it("Update Sample Status", () => {
    cy.contains("UPDATE SAMPLE TEST STATUS").click();
  });

  it("View Sample Details", () => {
    cy.contains("Sample Details").click();
  });

  it("Next/Previous Page", () => {
    // only works for desktop mode
    cy.get("button")
      .should("contain", ">")
      .contains(">")
      .click({ force: true });
    cy.get("button")
      .should("contain", "<")
      .contains("<")
      .click({ force: true });
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });
});
