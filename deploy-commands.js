require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`スラッシュコマンドを${commands.length}件登録します...`);

    if (process.env.GUILD_ID) {
      // 開発中: 特定サーバーのみに即時反映
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log('✅ サーバー限定でコマンドを登録しました（反映は数秒〜数分）。');
    } else {
      // 本番: 全サーバー向け（反映まで最大1時間程度かかることがある）
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log('✅ グローバルにコマンドを登録しました（反映に時間がかかる場合があります）。');
    }
  } catch (err) {
    console.error(err);
  }
})();
