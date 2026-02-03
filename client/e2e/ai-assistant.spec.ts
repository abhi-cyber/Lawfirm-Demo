import {test, expect} from "@playwright/test";

test.describe("Lex AI Assistant - client notes", () => {
  test("prompts for missing note content, saves note, link navigates to client notes", async ({
    page,
    request,
  }) => {
    const apiBaseUrl =
      process.env.PLAYWRIGHT_API_BASE_URL ?? "http://localhost:5001/api";

    // Create a unique client so the tool lookup is deterministic.
    const suffix = Date.now();
    const clientName = `ABC Corp ${suffix}`;

    const createRes = await request.post(`${apiBaseUrl}/clients`, {
      data: {
        name: clientName,
        email: `abc.${suffix}@example.com`,
        phone: "555-0000",
        status: "active",
        totalMatters: 0,
        notes: [],
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createdClient = await createRes.json();
    const clientId = createdClient?._id;
    expect(clientId).toBeTruthy();

    await page.goto("/");

    // Open Lex chat
    await page.getByTestId("lex-open").click();
    await expect(page.getByTestId("lex-panel")).toBeVisible();

    // Ask to add a note *without* note content
    await page
      .getByTestId("lex-input")
      .fill(`add a note in ${clientName} client`);
    await page.getByTestId("lex-send").click();

    // Should deterministically prompt for note content
    await expect(
      page.getByText(`What note would you like to add to "${clientName}"?`),
    ).toBeVisible();

    // Provide note content
    const noteContent = `Follow-up scheduled for ${suffix}`;
    await page.getByTestId("lex-input").fill(noteContent);
    await page.getByTestId("lex-send").click();

    // Should confirm the note was added and render a clickable link
    const confirmation = page.getByText("✅ Note added to client");
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(noteContent);
    const viewLink = page.getByRole("button", {name: "View Client Notes →"});
    await expect(viewLink).toBeVisible();

    // Link should navigate to the client detail page (notes tab)
    await viewLink.click();
    await page.waitForURL(`**/clients/${clientId}`);
    await expect(page).toHaveURL(new RegExp(`/clients/${clientId}$`));

    // Verify the note appears on the Client Detail -> Notes tab
    await expect(page.getByText(noteContent)).toBeVisible();
  });
});
