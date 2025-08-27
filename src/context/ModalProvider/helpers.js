let _scrollY = 0;

export function lockBodyScroll() {
   _scrollY = window.scrollY;
   Object.assign(document.body.style, {
      position: "fixed",
      top: `-${_scrollY}px`,
      left: "0",
      right: "0",
      width: "100%",
   });
}

export function unlockBodyScroll() {
   Object.assign(document.body.style, {
      position: "",
      top: "",
      left: "",
      right: "",
      width: "",
   });
   window.scrollTo(0, _scrollY);
}
