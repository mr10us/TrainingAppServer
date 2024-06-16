const { bot } = require("../index");
const { Password } = require("../models");
const UserService = require("../services/UserService");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat?.first_name || msg.chat?.username;
  const text = msg.text;


  if (text === "/start") {
    await UserService.createUserIfNotExist(chatId, username, null, "VISITOR");
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Почати тренування",
              web_app: {
                url: "https://magenta-fairy-c53297.netlify.app/",
              },
            },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, "Тисни кнопку, щоб почати:", inlineKeyboard);
  }
});
