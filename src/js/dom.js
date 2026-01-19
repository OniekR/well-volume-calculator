export const el = (id) => document.getElementById(id);
export const qs = (sel) => Array.from(document.querySelectorAll(sel));
export function setAttr(elm, name, val) {
  if (!elm) return;
  elm.setAttribute(name, val);
}
export function toggleClass(elm, cls, condition) {
  if (!elm) return;
  if (condition) elm.classList.add(cls);
  else elm.classList.remove(cls);
}
