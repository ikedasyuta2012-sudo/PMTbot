const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { scheduleRecurringMessage } = require('../utils/scheduler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('期限（時刻）を決めて、毎日その時刻にメッセージを自動送信します')
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('送信したい時刻（HH:MM形式、例: 21:00）')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('content')
        .setDescription('送信したいメッセージ内容')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('送信先チャンネル（省略するとこのチャンネル）')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    ),

  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const content = interaction.options.getString('content');
    const targetChannel = interaction.options.getChannel('channel') ?? interaction.channel;

    try {
      const { jobId, delay } = scheduleRecurringMessage({
        channel: targetChannel,
        content,
        timeStr,
      });

      const minutes = Math.round(delay / 60000);
      await interaction.reply({
        content: `⏰ 毎日 ${timeStr} に ${targetChannel} へ送信し続けるよ（初回は約${minutes}分後）。\n内容: ${content}\nID: \`${jobId}\`（止めたいときは \`/unschedule id:${jobId}\`）`,
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        content: `❌ ${err.message}`,
        ephemeral: true,
      });
    }
  },
};
