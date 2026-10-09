// 入口包里的通用小函数（非接口）。
import { Modal } from "ant-design-vue";
import { decryptStorage } from "@/legacy/storage";
import { getSettingValueByCode, SettingCodes } from "@/legacy/index";
import { izHistoryUsePositionList } from "@/legacy/api";

/** `J`：按扩展名检查上传文件类型（注意原包只取文件名第一个 "." 之后的那段） */
export const checkFileType = (file: { type?: string; name: string }, exts?: string[] | null) => {
  console.log(file.type);
  let n = ["jpg", "jpeg", "png", "gif", "JPG", "JPEG", "PNG", "GIF"];
  if (exts) n = exts;
  return n.findIndex((a) => a == file.name.split(".")[1]) >= 0;
};

/** `t`：a-form 密码强度校验器 (rule, value, callback)；localStorage.pwdSymbols 非空时还要求包含其中的特殊字符 */
export function validatePassword(_rule: unknown, value: string, _callback?: unknown): Promise<void> {
  let r = /^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{8,}$/;
  const symbols = localStorage.getItem("pwdSymbols");
  if (symbols && symbols != "") {
    const i = symbols.split("").map((o) => "\\" + o).join("");
    r = new RegExp("^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[" + i + "]).{8,}$");
  }
  if (r.test(value)) return Promise.resolve();
  let a = "密码长度不少于8位，且必须包含大小写字母和数字";
  if (symbols && symbols != "") a = "密码长度不少于8位，且必须包含大小写字母，数字及特殊字符：" + symbols;
  return Promise.reject(a);
}

/** `aN`：下载文件；给了文件名时先 fetch 成 blob 再以该名保存，否则直接打开链接 */
export const downloadFile = async (url: string, filename?: string) => {
  const n = document.createElement("a");
  if (filename) {
    const blob = await (await fetch(url)).blob();
    n.href = window.URL.createObjectURL(blob);
    n.download = filename;
  } else n.href = url;
  n.click();
  n.remove();
};

/**
 * `aa`：提取网络职位按钮的配置。name 取业务配置 extract_position_btn_name（默认"提取网络职位"），
 * 本单位有历史职位（izHistoryUsePositionList 成功）时 alert=true。
 * 与原包一致：任一请求失败时返回的 Promise 不会结束。
 */
export const getExtractPositionConfig = () =>
  new Promise<{ name: string; alert: boolean }>((resolve) => {
    (async () => {
      const corp = decryptStorage<{ id: string }>(localStorage.getItem("corpInfo"), "corpInfo");
      const [i, o]: any[] = await Promise.all([
        getSettingValueByCode({ code: SettingCodes.EXTRACT_POSITION_BTN_NAME }),
        izHistoryUsePositionList({ izFromTalents: undefined, companyId: corp!.id, positionStatus: "", name: "" }),
      ]);
      const a = { name: "提取网络职位", alert: false };
      if (i.success && i.result) a.name = i.result;
      if (o.success) a.alert = true;
      resolve(a);
    })();
  });

/** `ab`：确认是否提取信息（`label` 拼进提示，如"提取职位"） */
export const confirmExtract = (onOk: () => void, label: string) => {
  Modal.confirm({ title: "温馨提示", content: `是否${label}信息，在此基础上进行编辑？`, centered: true, okText: "去提取", onOk() { onOk(); }, cancelText: "取消", onCancel() { Modal.destroyAll(); } });
};

/** `T`：Rollup 的 commonjsGlobal（页面里内联的 CJS 库用它取全局对象） */
export const commonjsGlobal: any = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : {};
declare const global: any;

/** `V`：Rollup 的 getDefaultExportFromCjs */
export function getDefaultExportFromCjs<T = any>(x: any): T {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
