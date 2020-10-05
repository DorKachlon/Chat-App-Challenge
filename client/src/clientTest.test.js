const puppeteer = require("puppeteer");
const nock = require("nock");
const useNock = require("nock-puppeteer");

let mockMessages;
let page1, page2;
let browser;

describe("Client Tests", () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({
      // headless: false,
      slowMo: 100,
    });
    page1 = await browser.newPage();
    page2 = await browser.newPage();
    useNock(page1, ["http://localhost:3000/"]);
    useNock(page2, ["http://localhost:3000/"]);
  });

  beforeEach(() => {
    mockMessages = [
      {
        body: "hello",
        user: "Amir",
      },
      {
        body: "hey",
        user: "Matan",
      },
      {
        body: "bye",
        user: "Amir",
      },
    ];
  });

  afterAll(() => {
    browser.close();
  });

  test("if input and button exists", async () => {
    await page1.goto("http://localhost:3000/");

    await page1.waitForSelector("#messageInput", { visible: true });
    await page1.waitForSelector("#sendButton", { visible: true });
  }, 30000);

  test("if client requests messages and displays them on page", async () => {
    const getMessages = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .get("/messages")
      .reply(200, mockMessages);
    await page1.waitForSelector(".msg", { visible: true });
    const messages = await page1.$$(".msg");
    expect(messages.length).toBe(3);
    expect(getMessages.isDone()).toBe(true);
  }, 30000);

  test("if send button sends post request to server", async () => {
    const sendMessage = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .post("/messages")
      .reply(200);
    await page1.waitForSelector("#messageInput", { visible: true });
    await page1.type("#messageInput", "hello");
    const button = await page1.$("#sendButton");
    button.click();
    await timeout(2000);
    expect(sendMessage.isDone()).toBe(true);
  }, 30000);

  test("if page updates on update of data in server", async () => {
    const getMessages = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .get("/messages")
      .reply(200, mockMessages);
    const sendMessage = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .post("/messages")
      .reply(200);
    await page1.waitForSelector("#messageInput", { visible: true });
    const messages = await page1.$$(".msg");
    expect(messages.length).toBe(3);
    await page1.type("#messageInput", "Test");
    const button = await page1.$("#sendButton");
    mockMessages.push({ message: "Test", user: "Tal" });
    const getMessages2 = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .get("/messages")
      .reply(200, mockMessages);
    button.click();
    await timeout(4000);
    const messagesUpdated = await page1.$$(".msg");
    expect(messagesUpdated.length).toBe(4);
  }, 30000);

  test("change user name", async () => {
    const getMessages = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .get("/messages")
      .reply(200, mockMessages);
    const input = await page1.$("#changeUserInput");
    await input.click({ clickCount: 3 });
    await page1.type("#changeUserInput", "Amir");
    const myMessages = await page1.$$(".my-msg");
    const otherMessages = await page1.$$(".other-msg");
    expect(myMessages.length).toBe(2);
    expect(otherMessages.length).toBe(1);
  }, 30000);
  test("if messages from one tab shows on second tab", async () => {
    //page 2
    await page2.goto("http://localhost:3000/");
    const getMessages = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .persist()
      .get("/messages")
      .reply(200, mockMessages);

    await page2.waitForSelector(".msg", { visible: true });
    const messages = await page2.$$(".msg");
    expect(messages.length).toBe(3);

    getMessages.persist(false);

    //page 1
    const sendMessage = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .post("/messages")
      .reply(200);

    await page1.type("#messageInput", "Test");
    const button = await page1.$("#sendButton");
    mockMessages.push({ message: "Test2", user: "Tal" });
    button.click();

    //page 2
    const getMessagesUpdate = await nock("http://localhost:3000", {
      allowUnmocked: true,
    })
      .persist()
      .get("/messages")
      .reply(200, mockMessages);

    await timeout(4000);
    getMessagesUpdate.persist(false);
    await timeout(4000);
    const messagesUpdated = await page2.$$(".msg");
    await timeout(2000);
    expect(messagesUpdated.length).toBe(4);
  }, 30000);
});

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
