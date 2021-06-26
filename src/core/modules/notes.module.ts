import { Telegraf } from "telegraf";
import {
	addOrUpdateNote,
	deleteNote,
	getNote,
	getNotes,
} from "../controllers/notes.controller";
import { NoteI } from "../interfaces";
import { detectMsgFormat } from "../libs/messages";

export default function (bot: Telegraf) {
	bot.command("/notes", async (ctx) => {
		await getNotes(ctx);
	});
	bot.hears(/#[^\s]+/, async (ctx) => {
		let noteId: string = ctx.message.text.replace(/#/, "");
		let arg: string = noteId.split(" ")[1];
		if (arg && arg == "--rm") {
			noteId = noteId.split(" ")[0];
			return await deleteNote(ctx, noteId);
		}
		await getNote(ctx, noteId);
	});
	bot.command(["/add", "/save"], async (ctx) => {
		if (ctx.message.reply_to_message) {
			let id: string = ctx.message.text
				.replace(/\/add|\/save/, "")
				.trim()
				.split(" ")[0];
			if (id.length < 1) {
				ctx.reply("Ingrese un nombre para la nota");
				return;
			}
			let note: NoteI = await detectMsgFormat(
				ctx.message.reply_to_message,
				id,
			);
			await addOrUpdateNote(ctx, note);
		} else {
			let id: string = ctx.message.text
				.replace(/\/add|\/save/, "")
				.trim()
				.split(" ")[0];
			if (id.length < 1) {
				ctx.reply("Ingrese un nombre para la nota");
				return;
			}
			let text = ctx.message.text
				.replace(/\/add|\/save/, "")
				.trim()
				.replace(id, "")
				.trim();
			if (text.length < 1) {
				ctx.reply("Ingrese el contenido para la nota");
				return;
			}
			let note: NoteI = { id, text };
			await addOrUpdateNote(ctx, note);
		}
	});
}
