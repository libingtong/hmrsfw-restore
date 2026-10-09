// Global directives registered by the original entry chunk: v-trim (strip whitespace on blur/input/Enter) and v-click-outside.
import type { App, Directive } from "vue";
const inputOf = (el: HTMLElement) => (el.querySelector("input") ? el.querySelector("input") : el.querySelector("textarea")) as HTMLInputElement | HTMLTextAreaElement | null;
const trigger = (el: Element, type: string) => { const e = document.createEvent("HTMLEvents"); e.initEvent(type, true, true); el.dispatchEvent(e); };
export const trim: Directive = {
  mounted(el: any) {
    const input = inputOf(el);
    if (!input) return;
    const handler = () => { const v = el.inputEle.value.replace(/\s+/g, "") || ""; if (el.inputEle.value !== v) { el.inputEle.value = v; trigger(input, "input"); } };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Enter") handler(); };
    el.inputEle = input; el.__blurHandler__ = handler; el.__keyHandler__ = keyHandler;
    input.addEventListener("blur", handler); input.addEventListener("input", handler); input.addEventListener("keydown", keyHandler);
  },
  beforeUnmount(el: any) { el.removeEventListener("blur", el.__blurHandler__); el.removeEventListener("keydown", el.__keyHandler__); el.removeEventListener("input", el.__blurHandler__); },
};
export const clickOutside: Directive = {
  beforeMount(el: any, binding) { el.clickOutsideEvent = (e: Event) => { if (!(el === e.target || el.contains(e.target as Node))) binding.value(e); }; document.addEventListener("click", el.clickOutsideEvent); },
  unmounted(el: any) { document.removeEventListener("click", el.clickOutsideEvent); },
};
export const registerDirectives = (app: App) => { app.directive("trim", trim); app.directive("click-outside", clickOutside); };
