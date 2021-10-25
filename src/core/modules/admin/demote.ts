import { ChatMember } from 'grammy/out/platform';
import { BOT_ID } from '@config';
import { Cortana } from '@context';
import { log } from '@libs/messages';

export async function demoteteCmd(ctx: Cortana) {
  try {
    const { global, helpers: _ } = await ctx.lang();
    if (ctx.chat.type === 'private') return ctx.reply(global.noPrivateChat);
    if (!ctx.msg.reply_to_message) return ctx.reply(global.replyMissing);
    const A: ChatMember = await ctx.getChatMember(ctx.msg.from.id); // Demoter
    const B: ChatMember = await ctx.getChatMember(ctx.msg.reply_to_message.from.id); // Member
    if (A.status === 'member') return ctx.reply(_.youDontHavePermissions('demote'));
    if (B.status === 'creator') return ctx.reply(_.anyToCreator('demote'));
    if (B.user.id === BOT_ID) return ctx.reply(_.youCantAffectMe('demote'));
    if (B.user.id === A.user.id) return ctx.reply(_.youCanNot('demote'));
    if (B.status === 'administrator' && A.status === 'administrator')
      return ctx.reply(_.alreadyIsAdmin(B.user.first_name));
    await demote(ctx, B.user.id)
    // return ctx.reply('El usuario ha sido degradado');
  } catch (error) {
    const [l] = error.stack.match(/(d+):(d+)/);
    log({ ctx, error, __filename, l, f: 'promoteCmd()' });
  }
}

export async function demote(ctx: Cortana, id: number) {
  try {
    return await ctx.promoteChatMember(id, {
      can_change_info: false,
      // can_post_messages: false,
      // can_edit_messages: false,
      // can_delete_messages: false,
      // can_invite_users: false,
      // can_restrict_members: false,
      // can_pin_messages: false,
      // can_promote_members: false,
      // can_manage_chat: false
    });
  } catch (error) {
    console.log(error);
    return false;
  }
}
