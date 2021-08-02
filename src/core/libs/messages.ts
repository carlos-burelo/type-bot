import day from 'dayjs';
import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { _bot } from '../../config';
import { ChatUserI, editMessageI, logErrorI, MsgI, sendMessageI } from '../interfaces';

/**
 * Iterate over the properties of the object,
 * keeping the necessary ones and obtaining the message format
 * @param {any} message
 * @param {string} id?
 * @return {MsgI}
 */
export function matchMessage(message: any, id?: string): MsgI {
  try {
    const msg: MsgI = {};
    Object.keys(message).map((a) => {
      if (
        a !== 'message_id' &&
        a !== 'from' &&
        a !== 'chat' &&
        a !== 'date' &&
        a !== 'animation' &&
        a !== 'edit_date' &&
        a !== 'author_signature' &&
        a !== 'forward_from_chat' &&
        a !== 'forward_from' &&
        a !== 'forward_date' &&
        a !== 'forward_from_message_id' &&
        a !== 'forward_signature' &&
        a !== 'sender_chat'
      ) {
        msg[a] = message[a];
      }
    });
    if ('document' in msg) {
      msg.content = msg.content.file_id;
      msg.type = 'document';
      delete msg['document'];
    }
    if ('photo' in msg) {
      msg.content = msg.photo[msg.photo.length - 1].file_id;
      msg.type = 'photo';
      delete msg['photo'];
    }
    if ('sticker' in msg) {
      msg.content = msg.sticker.file_id;
      msg.type = 'sticker';
      delete msg['sticker'];
    }
    if ('audio' in msg) {
      msg.content = msg.audio.file_id;
      msg.type = 'audio';
      delete msg['audio'];
    }
    if ('voice' in msg) {
      msg.content = msg.voice.file_id;
      msg.type = 'voice';
      delete msg['voice'];
    }
    if ('video' in msg) {
      msg.content = msg.video.file_id;
      msg.type = 'video';
      delete msg['video'];
    }
    if ('poll' in msg) {
      msg.content = msg.poll.question;
      msg.type = 'poll';
      msg.options = msg.poll.options.map((i: any) => i.text);
      delete msg.poll.id;
      delete msg.poll.question;
      delete msg.poll.options;
      msg.args = msg.poll;
      delete msg.poll;
    }
    if ('text' in msg) {
      msg.content = msg.text;
      msg.type = 'text';
      delete msg['text'];
    }
    if (id) {
      msg.id = id;
    }
    return msg;
  } catch (error) {
    return undefined;
  }
}
export function parseVars(variables: ChatUserI | any, text: string): string {
  const keys: string[] = Object.keys(variables);
  keys.map((a: string) => {
    text = text.replace(new RegExp(`{${a}}`, 'g'), variables[a]);
  });
  return text;
}
export function editMessage(msg: editMessageI) {
  let { ctx, id, text, keyboard, mode } = msg;
  let id2 = ctx.chat.id;
  if (!mode) mode = 'Markdown';
  return ctx.telegram.editMessageText(id2, id, id2.toString(), text, {
    reply_markup: keyboard,
    parse_mode: mode
  });
}
export function sendMessage(message: sendMessageI): Promise<Message> {
  const { ctx, msg, id = ctx.chat.id, vars } = message;
  try {
    if (vars) {
      msg.content = parseVars(vars, msg.content);
    }
    if (msg.type == 'text') {
      return ctx.telegram.sendMessage(id, msg.content, {
        entities: msg.entities,
        reply_markup: msg.reply_markup,
        parse_mode: 'Markdown'
      });
    }
    if (msg.type == 'photo') {
      return ctx.telegram.sendPhoto(id, msg.content, {
        caption: msg.caption,
        caption_entities: msg.caption_entities,
        reply_markup: msg.reply_markup
      });
    }
    if (msg.type == 'document') {
      return ctx.telegram.sendDocument(id, msg.content, {
        reply_markup: msg.reply_markup,
        caption: msg.caption,
        caption_entities: msg.caption_entities,
        thumb: msg.thumb
      });
    }
    if (msg.type == 'sticker') {
      ctx.telegram.sendSticker(id, msg.content, {
        reply_markup: msg.reply_markup
      });
    }
    if (msg.type == 'audio') {
      return ctx.telegram.sendAudio(id, msg.content, {
        caption: msg.caption,
        caption_entities: msg.caption_entities,
        thumb: msg.thumb
      });
    }
    if (msg.type == 'voice') {
      return ctx.telegram.sendVideo(id, msg.content, {
        caption: msg.caption,
        caption_entities: msg.caption_entities,
        reply_markup: msg.reply_markup,
        thumb: msg.thumb
      });
    }
    if (msg.type == 'video') {
      return ctx.telegram.sendVideo(id, msg.content, {
        caption: msg.caption,
        caption_entities: msg.caption_entities,
        reply_markup: msg.reply_markup,
        thumb: msg.thumb
      });
    }
    if (msg.type == 'poll') {
      return ctx.telegram.sendPoll(id, msg.content, msg.options, msg.args);
    } else {
      return ctx.telegram.sendMessage(id, msg.content, {
        entities: msg.entities,
        reply_markup: msg.reply_markup
      });
    }
  } catch (error) {
    return ctx.telegram.sendMessage(id, msg.content, {
      parse_mode: 'Markdown'
    });
  }
}
export function clean(text: string, pattern?: string[] | RegExp): string {
  if (pattern) {
    if (pattern instanceof RegExp) {
      return (text = text.replace(pattern, '').trim());
    } else {
      pattern.map((i) => {
        text = text.replace(i, '');
      });
      return text.trim();
    }
  } else {
    return (text = text.replace(/\&\w+:?(\w|\S)*\W?|\/\w+\s?/g, '').trim());
  }
}
export function getArguments(text: string) {
  let matched: string[] = text.match(/&\w+:?\w+/g);
  if (matched == null || matched == undefined) {
    return undefined;
  }
  return matched;
}
export async function errorHandler({ ctx, error, __filename, l, f }: logErrorI) {
  const name = __filename.split(/[\\/]/).pop();
  let [link] = __filename.match(/\\\w+\\\w+\.\w+\.ts/g);
  link = link.replace(/\\/g, '/');
  let root = '/blob/master/src/core';
  let line = `${l.split(':')[0]}`;
  let url = `${_bot.repository}${root}${link}\#L${line}`;
  const msg =
    `<b>Error in:</b> <b><a href="${url}">${name}</a></b>\n\n` +
    `<b>Hour:</b> ${day().hour()}:${day().minute()}\n` +
    `<b>Account:</b> <code>${ctx.chat.id}</code>\n` +
    `<b>Location:</b> ${l}\n` +
    `<b>Function:</b> ${f}\n` +
    `<b>Description:</b>\n<code>${error.message}</code>`;
  return ctx.telegram.sendMessage('@CortanaLogs', msg, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });
}
export function getTime(ctx: Context, text: string): number {
  try {
    const regex = /\d+[mhd]/gi;
    const match = text.match(regex);
    if (match !== null) {
      const time2 = parseInt(match[0].replace(/\D/, ''));
      if (match[0].includes('m')) {
        return ctx.message.date + time2 * 60;
      }
      if (match[0].includes('h')) {
        return ctx.message.date + time2 * 60 * 60;
      }
      if (match[0].includes('d')) {
        return ctx.message.date + time2 * 24 * 60 * 60;
      } else {
        return ctx.message.date + time2 * 24 * 60 * 60;
      }
    }
  } catch (error) {}
}
