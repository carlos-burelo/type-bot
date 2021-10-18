import { Cortana } from '../../../context';
import { buttonBuilder } from '../../libs/buttons';
import { log } from '../../libs/messages';

export async function startCmd(ctx: Cortana) {
  try {
    const { start: _ } = await ctx.lang();
    const user = ctx.from.first_name;
    const buttons = buttonBuilder(_.btns, 2);
    ctx.replyWithMarkdown(_.msg(user), { reply_markup: buttons });
  } catch (error) {
    const [l] = error.stack.match(/(d+):(d+)/);
    log({ ctx, error, __filename, l, f: 'startCmd()' });
  }
}
