const { bot } = require("../index");
const UserService = require("../services/UserService");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat?.first_name || msg.chat?.username;
  const text = msg.text;

  if (text === "/start") {
    await UserService.createUserIfNotExist(chatId, username, null, "USER");
    await bot.sendMessage(chatId, "Тисни 'Почати'");
  }
});
