import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('create_auth')
  .setDescription('認証パネルを作成します')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  try {
    console.log(`認証パネル作成コマンドが実行されました: ${interaction.user.tag}`);
    
    const authEmbed = new EmbedBuilder()
      .setTitle('WELCOME TO ARJH!!')
      .setDescription('荒らし情報局へようこそ、入室時にDMでも教えした通り荒らし目的のサーバーではありません。\n認証ボタンを押すと認証が開始されます\n認証が完了した時点でルールに同意したものとします。')
      .setColor('#0099ff');
    
    const authButton = new ButtonBuilder()
      .setCustomId('auth_button')
      .setLabel('認証')
      .setStyle(ButtonStyle.Primary);
    
    const row = new ActionRowBuilder()
      .addComponents(authButton);
    
    await interaction.reply({ embeds: [authEmbed], components: [row] });
    console.log('認証パネルを正常に作成しました');
  } catch (error) {
    console.error('認証パネル作成中にエラーが発生しました:', error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '認証パネルの作成中にエラーが発生しました。', ephemeral: true });
    } else {
      await interaction.followUp({ content: '認証パネルの作成中にエラーが発生しました。', ephemeral: true });
    }
  }
}