import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('create_rule')
  .setDescription('ルールを作成')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  try {
    console.log(`ルール作成コマンドが実行されました: ${interaction.user.tag}`);
    
    const authEmbed = new EmbedBuilder()
      .setTitle('Rules | ルール')
      .setDescription('**1.雑談チャンネル内での暴言、ヘイトスピーチ等の誰かを不快にする言動は禁止します。**\n**2.ARJH名義での荒らし行為は禁止します\nまたARJH名義での荒らしを発見した場合、それは悪意ある第3者の悪戯ということを忘れないでください。**\n**3.もちろんサーバー内での荒らし行為も禁止です。**\n**4.荒らしを発見した場合、迷わずチケットの作成をして報告してください\nその行動を怠った場合、荒らしを隠蔽する行為としてBANします。**\nルールを守らなかった場合、TO、Kick、BANの処罰が下ります。\n※これらのルールは改定、追加される可能性があります。')
      .setColor('#03fc24');
    
    // ボタンなしでEmbedだけを送信
    await interaction.reply({ 
      embeds: [authEmbed],
      ephemeral: false // trueにすると実行したユーザーだけに表示されます
    });
    
  } catch (error) {
    console.error('Error executing create_rule command:', error);
    
    // エラーメッセージをユーザーに送信
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
    } else {
      await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
    }
  }
}