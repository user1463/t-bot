require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs");
const path = require("path");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/song (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, `Searching for "${query}"...`);

  const result = await ytSearch(query);
  const video = result.videos[0];

  if (!video) return bot.sendMessage(chatId, "No results found.");

  const url = video.url;
  const filePath = path.join(__dirname, `${video.title}.mp3`);

  bot.sendMessage(chatId, `Downloading "${video.title}"...`);

  const stream = ytdl(url, { filter: "audioonly" }).pipe(fs.createWriteStream(filePath));

  stream.on("finish", () => {
    bot.sendAudio(chatId, filePath).then(() => {
      fs.unlinkSync(filePath); // cleanup
    });
  });
});
