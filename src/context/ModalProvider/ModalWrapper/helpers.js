let mainNavigation = null;

export function hideScrollbar() {
   const scrollbarWidth = window.innerWidth - document.body.clientWidth;
   document.body.style.overflow = "hidden";
   document.body.style.paddingRight = scrollbarWidth + "px";
   getMainNavigation().style.paddingRight = scrollbarWidth + "px";
}

export function showScrollbar() {
   document.body.style.overflow = "scroll";
   document.body.style.paddingRight = 0;
   getMainNavigation().style.paddingRight = 0;
}

function getMainNavigation() {
   if (mainNavigation !== null) {
      return mainNavigation;
   }

   const element = document
      .querySelector("main-navigation")
      .shadowRoot.querySelector(".main-navigation");
   mainNavigation = element;

   return mainNavigation;
}
