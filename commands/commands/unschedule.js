const { SlashCommandBuilder } = require('discord.js');
const { cancelJob } = require('../utils/scheduler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unschedule')
    .setDescription('/message で予約した繰り返し送信を停止します')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('/message実行時に返されたID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const jobId = interaction.options.getString('id');
    const ok = cancelJob(jobId);

    await interaction.reply({
      content: ok
        ? `🛑 ID \`${jobId}\` の予約を停止したよ。`
        : `❌ ID \`${jobId}\` の予約は見つからなかった。/message実行時に表示されたIDを確認してね。`,
      ephemeral: true,
    });
  },
};
