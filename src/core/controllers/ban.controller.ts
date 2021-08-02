import { _bot, _owner } from '../../config';
import { Context } from 'telegraf';
import { ChatMember } from 'telegraf/typings/core/types/typegram';
import { ChatUserI, GbannedI, MsgI } from '../interfaces';
import { db, getDatabases, isSudo, lang } from '../../database';
import { errorHandler } from '../libs/messages';

export async function decideBan(ctx: Context, A: ChatMember, B: ChatMember) {
  try {
    const _ = await lang(ctx);
    if (B.user.id == _bot.id) {
      return ctx.reply(_.global.preventBot);
    }
    if (B.user.id == _owner.id && A.user.id == _owner.id) {
      return ctx.reply(_.global.preventOwner);
    }
    if (B.user.id == _owner.id) {
      return ctx.reply(_.global.permissionsDenied);
    }
    if (A.status !== 'creator' && B.status == 'creator') {
      return ctx.reply(_.global.permissionsDenied);
    }
    if (A.user.id !== _owner.id && B.user.id == _bot.id) {
      return ctx.reply(_.global.permissionsDenied);
    }
    if (A.user.id == _owner.id) {
      setBan(ctx, A, B);
    }
    if (isSudo(B.user.id)) {
      return ctx.reply(_.global.preventSudo(B.user.first_name));
    }
    if (A.user.id == B.user.id) {
      return ctx.reply(_.helpers.noYourAutoAction('ban'));
    }
    if (A.status == 'member' && B.status == 'administrator') {
      return ctx.reply(_.helpers.memberActionAdmin('ban'));
    }
    if (A.status == 'administrator' && B.status == 'administrator') {
      return ctx.reply(_.helpers.adminActionAdmin('ban'));
    }
    if (A.status == 'administrator' && B.status == 'creator') {
      return ctx.reply(_.helpers.anyActionCreator('ban'));
    }
    if (A.status == 'member' && B.status == 'creator') {
      return ctx.reply(_.helpers.anyActionCreator('ban'));
    }
    setBan(ctx, A, B);
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'decideBan()', l });
  }
}
export async function decideUnBan(ctx: Context, A: ChatMember, B: ChatMember) {
  const _ = await lang(ctx);
  try {
    if (B.user.id == _bot.id) {
      return ctx.reply(_.global.preventBot);
    }
    if (B.user.id == _owner.id) {
      return ctx.reply(_.global.preventOwner);
    }
    if (A.user.id == _owner.id) {
      setUnBan(ctx, A, B);
    }
    if (A.status == 'member') {
      return ctx.reply(_.global.permissionsDenied);
    }
    setUnBan(ctx, A, B);
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'decideUnban()', l });
  }
}
export async function decideGban(ctx: Context, A: ChatMember, B: ChatMember, reason: string) {
  try {
    const _ = await lang(ctx);
    if (B.status == 'creator') {
      return ctx.reply(_.helpers.anyActionCreator('ban'));
    }
    if (A.status !== 'creator' || A.user.id !== _owner.id) {
      return ctx.reply(_.global.permissionsDenied);
    }
    setGban(ctx, B.user, reason);
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'decideGban()', l });
  }
}
export async function setBan(ctx: Context, A: ChatMember, B: ChatMember) {
  const _ = await lang(ctx);
  try {
    ctx.kickChatMember(B.user.id);
    return ctx.reply(_.helpers.anyActionSuccess('banned', A.user.first_name, B.user.first_name));
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'setBan()', l });
  }
}
export async function setUnBan(ctx: Context, A: ChatMember, B: ChatMember) {
  const _ = await lang(ctx);
  try {
    ctx.unbanChatMember(B.user.id, {
      only_if_banned: true
    });
    return ctx.reply(_.banModule.unBanSuccess);
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'setUnBan()', l });
  }
}
export async function setBanMessage(ctx: Context, message: MsgI) {
  try {
    const { banModule: _ } = await lang(ctx);
    db(ctx.chat).get(`prefs`).unset('banPrefs').write();
    db(ctx.chat).get('prefs').assign({ banPrefs: message }).write();
    return ctx.reply(_.setBanSuccess);
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'setBanMessage()', l });
  }
}
export async function setGban(ctx: Context, B: ChatUserI, reason: string) {
  try {
    const _ = await lang(ctx);
    registerInBanned(ctx, B, reason);
    let groups = getDatabases();
    groups.forEach(async ({ id }) => {
      await ctx.telegram.kickChatMember(id, B.id);
    });
    return ctx.reply(_.helpers.anyActionSuccess('ban', _bot.first_name, B.first_name));
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'setGban()', l });
  }
}
export async function registerInBanned(ctx: Context, user: ChatUserI, reason: string) {
  try {
    let userBanned: GbannedI = {
      first_name: user.first_name,
      username: user.username,
      id: user.id,
      reason: reason
    };
    const find = db().get('gbanned').find({ id: user.id }).value();
    if (find || find !== undefined) {
      db().get('gbanned').push(userBanned).write();
    } else {
      db().get('gbanned').remove({ id: user.id }).write();
      db().get('gbanned').push(userBanned).write();
    }
  } catch (error) {
    const [l] = error.stack.match(/(\d+):(\d+)/);
    errorHandler({ ctx, error, __filename, f: 'registerInBanned()', l });
  }
}
