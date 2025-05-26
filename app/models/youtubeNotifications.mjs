import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ".data/db.sqlite3",
});

const youtubeNotifications = sequelize.define("youtubeNotifications", {
  guildId: {
    type: DataTypes.STRING,
  },
  textChannelId: {
    type: DataTypes.STRING,
  },
  channelName: {
    type: DataTypes.STRING,
  },
  channelUrl: {
    type: DataTypes.STRING,
  },
  channelFeedUrl: {
    type: DataTypes.STRING,
  },
});

export default youtubeNotifications;