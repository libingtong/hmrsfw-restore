// Restored from message.<hash>.js. Original exports: s → successCountdown, i → infoAlert.
import { Modal } from "ant-design-vue";
/** `s`: success dialog that closes itself after 5 seconds (the content is re-set every second, as in the original). */
export function successCountdown(content: string) {
  let seconds = 5;
  const modal = Modal.success({ title: "提交成功", content });
  const timer = setInterval(() => { seconds -= 1; modal.update({ content }); }, 1000);
  setTimeout(() => { clearInterval(timer); modal.destroy(); }, seconds * 1000);
}
/** `i`: information dialog with an OK button. */
export function infoAlert(content: string, okText?: string, title?: string) {
  Modal.info({ title: title || "温馨提示", content, okText: okText || "确定", onOk() {} });
}
export { successCountdown as s, infoAlert as i };
