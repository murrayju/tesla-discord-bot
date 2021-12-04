import configPkg from '@murrayju/config';
import fetch from 'node-fetch';
import {
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v8';

const { default: config } = configPkg;

export const sendMessage = (
  message: RESTPostAPIChannelMessageJSONBody,
): Promise<RESTPostAPIChannelMessageResult> =>
  fetch(
    `https://discord.com/api/channels/${config.get(
      'discord.channel',
    )}/messages`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bot ${config.get('discord.bot.token')}`,
      },
      body: JSON.stringify(message),
    },
  ).then((r) => r.json() as Promise<RESTPostAPIChannelMessageResult>);
