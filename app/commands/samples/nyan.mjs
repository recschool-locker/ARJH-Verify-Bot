import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('応答確認')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply('応答中。');
  } else {
    // Reply with error message as an ephemeral message (only visible to the command user)
    await interaction.reply({ 
      content: 'コマンドの実行中に不明なエラーが発生。', 
      ephemeral: true 
    });
  }
}