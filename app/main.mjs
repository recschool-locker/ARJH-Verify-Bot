import fs from "fs";
import path from "path";
import express from "express";
import { Client, Collection, Events, GatewayIntentBits, ActivityType, EmbedBuilder, Partials } from "discord.js";
import CommandsRegister from "./regist-commands.mjs";
import Notification from "./models/notification.mjs";
import YoutubeFeeds from "./models/youtubeFeeds.mjs";
import YoutubeNotifications from "./models/youtubeNotifications.mjs";

import Sequelize from "sequelize";
import Parser from 'rss-parser';
const parser = new Parser();

import { Client as Youtubei, MusicClient } from "youtubei";

const youtubei = new Youtubei();

let postCount = 0;
const app = express();
app.listen(3000);
app.post('/', function(req, res) {
  console.log(`Received POST request.`);
  
  postCount++;
  if (postCount == 10) {
    trigger();
    postCount = 0;
  }
  
  res.send('POST response by glitch');
})
app.get('/', function(req, res) {
  res.send('<a href="https://note.com/exteoi/n/n0ea64e258797</a> に解説があります。');
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

const categoryFoldersPath = path.join(process.cwd(), "commands");
const commandFolders = fs.readdirSync(categoryFoldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(categoryFoldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".mjs"));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath).then((module) => {
      client.commands.set(module.data.name, module);
      console.log(`コマンド ${module.data.name} を読み込みました`);
    });
  }
}

const handlers = new Map();

const handlersPath = path.join(process.cwd(), "handlers");
const handlerFiles = fs.readdirSync(handlersPath).filter((file) => file.endsWith(".mjs"));

for (const file of handlerFiles) {
  const filePath = path.join(handlersPath, file);
  import(filePath).then((module) => {
    handlers.set(file.slice(0, -4), module);
    console.log(`ハンドラー ${file.slice(0, -4)} を読み込みました`);
  });
}

// すべてのhandlers.getの呼び出しを安全に行うユーティリティ関数
function safelyCallHandler(handlerName, ...args) {
  if (handlers.has(handlerName)) {
    return handlers.get(handlerName).default(...args);
  } else {
    console.log(`警告: ${handlerName}ハンドラーが見つかりません`);
    return Promise.resolve(); // 空のPromiseを返して処理を続行できるようにする
  }
}

// messageCreateイベントの修正
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  // DMチャンネルの場合は特別な処理をしない（awaitMessagesに任せる）
  if (message.channel.type === 'DM') {
    console.log(`DMメッセージ受信: ${message.content} (ユーザー: ${message.author.tag})`);
    return;
  }
  
  // 通常のメッセージハンドラーを安全に呼び出し
  await safelyCallHandler("messageCreate", message);
});

// interactionCreateイベントの修正
client.on("interactionCreate", async (interaction) => {
  try {
    // コマンドの場合
    if (interaction.isChatInputCommand()) {
      console.log(`コマンド実行: ${interaction.commandName} (ユーザー: ${interaction.user.tag})`);
      
      const command = client.commands.get(interaction.commandName);
      
      if (!command) {
        console.error(`${interaction.commandName} というコマンドが見つかりません。`);
        return;
      }
      
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`コマンド実行エラー: ${error}`);
        const replyContent = { content: 'コマンド実行中にエラーが発生しました。', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyContent);
        } else {
          await interaction.reply(replyContent);
        }
      }
      return;
    }
    
    // ボタンの場合は専用処理
    if (interaction.isButton()) {
      console.log(`ボタンインタラクション検出: ${interaction.customId} (ユーザー: ${interaction.user.tag})`);
      
      if (interaction.customId === 'auth_button') {
        await handleAuthButton(interaction);
        return;
      }
    }
    
    // その他のインタラクションは通常のハンドラーへ
    await safelyCallHandler("interactionCreate", interaction);
  } catch (error) {
    console.error(`インタラクション処理中のエラー: ${error}`);
  }
});

// voiceStateUpdateイベントの修正
client.on("voiceStateUpdate", async (oldState, newState) => {
  await safelyCallHandler("voiceStateUpdate", oldState, newState);
});

// 認証ボタン処理の関数
async function handleAuthButton(interaction) {
  try {
    // インタラクションが既に応答済みかどうかをチェック
    if (interaction.replied || interaction.deferred) {
      console.log(`インタラクションは既に応答済みです: ${interaction.user.tag}`);
      return;
    }
    
    // まず応答を遅延させる（タイムアウト防止）
    await interaction.deferReply({ ephemeral: true });
    
    console.log(`認証ボタンが押されました: ${interaction.user.tag}`);
    
    // 計算問題を生成
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const answer = num1 + num2;
    
    console.log(`認証問題: ${num1} + ${num2} = ${answer} (ユーザー: ${interaction.user.tag})`);
    
    try {
      // DMを送信
      const dmChannel = await interaction.user.createDM();
      await dmChannel.send(`認証のため、簡単な計算問題に答えてください。\n**${num1} + ${num2} = ?**\n30秒以内に正しい答えを入力してください。`);
      console.log(`DMを送信しました: ${interaction.user.tag}`);
      
      // 遅延応答を編集
      await interaction.editReply({ content: '認証を開始します。DMをご確認ください。', ephemeral: true });
      
      // 回答を待機
      const filter = m => !m.author.bot;
      console.log(`回答待機中: ${interaction.user.tag}`);
      
      try {
        const collected = await dmChannel.awaitMessages({ 
          filter, 
          max: 1, 
          time: 30000, 
          errors: ['time'] 
        });
        
        const reply = collected.first();
        console.log(`回答を受信: ${reply.content} (ユーザー: ${interaction.user.tag})`);
        
        // 回答を検証
        if (parseInt(reply.content) === answer) {
          console.log(`正解: ${interaction.user.tag}`);
          
          try {
            const role = interaction.guild.roles.cache.find(role => role.name === '✅認証完了');
            
            if (role) {
              await interaction.member.roles.add(role);
              await dmChannel.send('認証に成功しました！サーバーへようこそ！');
              console.log(`ロール追加完了: ${interaction.user.tag}`);
            } else {
              console.error(`ロールが見つかりません: ✅認証完了`);
              await dmChannel.send('認証に成功しましたが、ロールが見つかりませんでした。サーバー管理者にお問い合わせください。');
            }
          } catch (roleError) {
            console.error(`ロール付与エラー: ${roleError}`);
            await dmChannel.send('認証に成功しましたが、ロールの付与中にエラーが発生しました。サーバー管理者にお問い合わせください。');
          }
        } else {
          await dmChannel.send('不正解です。もう一度認証ボタンを押して試してください。');
          console.log(`不正解: ${interaction.user.tag}`);
        }
      } catch (timeoutErr) {
        console.log(`タイムアウト: ${interaction.user.tag}`);
        await dmChannel.send('時間切れです。もう一度認証ボタンを押して試してください。');
      }
    } catch (dmError) {
      console.error(`DMエラー: ${dmError} (ユーザー: ${interaction.user.tag})`);
      await interaction.editReply({ 
        content: 'DMを送信できませんでした。プライバシー設定でDMを許可しているか確認してください。', 
        ephemeral: true 
      });
    }
  } catch (error) {
    console.error('認証処理中にエラーが発生しました:', error);
    try {
      // インタラクションが既に応答済みかどうかを確認
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'エラーが発生しました。もう一度お試しください。', ephemeral: true });
      } else {
        await interaction.editReply({ content: 'エラーが発生しました。もう一度お試しください。', ephemeral: true });
      }
    } catch (e) {
      console.error('エラー応答中の二次エラー:', e);
    }
  }
}

// YouTube通知の部分
async function checkFeed(channelFeedUrl) {
  try {
    const youtubeFeed = await YoutubeFeeds.findOne({
      where: {
        channelFeedUrl: channelFeedUrl,
      },
    });
    
    if (!youtubeFeed) {
      console.error(`YouTubeフィード情報が見つかりません: ${channelFeedUrl}`);
      return;
    }
    
    const checkedDate = new Date(youtubeFeed.channelLatestUpdateDate);
    let latestDate = new Date(youtubeFeed.channelLatestUpdateDate);
    
    try {
      const feed = await parser.parseURL(channelFeedUrl);
      const videos = feed.items.map(i => {
        const now = new Date(i.isoDate);
        
        if (now > checkedDate) {
          if (now > latestDate) {
            latestDate = now
          }
          return i;
        }
        return null;
      }).filter(item => item !== null);
      
      const notifications = await YoutubeNotifications.findAll({
        where: {
          channelFeedUrl: channelFeedUrl,
        },
      });
      
      const youtubeChannelId = channelFeedUrl.split('=').at(1);
      
      for (const v of videos) {
        if (!v) continue;
        
        try {
          const youtubeVideolId = v.link.split('=').at(1);
          const youtubeVideo = await youtubei.getVideo(youtubeVideolId);
          
          if (!youtubeVideo) {
            console.error(`YouTube動画情報の取得に失敗: ${youtubeVideolId}`);
            continue;
          }
          
          const embed = new EmbedBuilder()
            .setColor(0xcd201f)
            .setAuthor({ name: v.author, url: `https://www.youtube.com/channel/${youtubeChannelId}`})
            .setTitle(v.title)
            .setURL(v.link)
            .setDescription(youtubeVideo.description || 'No description')
            .setImage(youtubeVideo.thumbnails?.best || '')
            .setTimestamp(new Date(v.isoDate));
          
          for (const n of notifications) {
            try {
              const channel = client.channels.cache.get(n.textChannelId);
              if (channel) {
                await channel.send({ embeds: [embed] });
                console.log(`通知を送信しました: ${v.title} (チャンネル: ${n.textChannelId})`);
              } else {
                console.error(`テキストチャンネルが見つかりません: ${n.textChannelId})`);
              }
            } catch (channelError) {
              console.error(`チャンネルへの送信エラー: ${channelError}`);
            }
          }
        } catch (videoError) {
          console.error(`ビデオ処理エラー: ${videoError}`);
        }
      }
      
      await YoutubeFeeds.update(
        { channelLatestUpdateDate: latestDate.toISOString() },
        {
          where: {
            channelFeedUrl: channelFeedUrl,
          },
        },
      );
    } catch (parserError) {
      console.error(`フィードのパースエラー: ${parserError}`);
    }
  } catch (error) {
    console.error(`checkFeed全体エラー: ${error}`);
  }
}

// trigger関数の定義（既存のコードにあれば維持する）
async function trigger() {
  try {
    // triggerの実装（もしファイル内に無ければ、空の関数として定義）
    console.log('trigger関数が呼び出されました');
  } catch (error) {
    console.error('trigger関数エラー:', error);
  }
}

client.once(Events.ClientReady, async readyClient => {
  console.log(`準備完了！${readyClient.user.tag}としてログインしました！`);
  
  // コマンド登録処理を呼び出し
  await CommandsRegister();
  
  // ステータスを設定
  client.user.setPresence({
    activities: [{ name: '荒らしの情報', type: ActivityType.Playing }],
    status: 'online',
  });
  
  // コマンド登録状況の確認
  console.log(`登録済みコマンド数: ${client.commands.size}`);
});

// ボットにログイン
client.login(process.env.TOKEN);