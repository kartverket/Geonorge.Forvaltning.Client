import { useEffect } from "react";
import { useSelector } from "react-redux";
import { MainNavigation } from "@kartverket/geonorge-web-components/MainNavigation";
import "@kartverket/geonorge-web-components/index.css";
import Cookies from "js-cookie";
import environment from "config/environment";
import { useAuth } from "context/AuthProvider";

const isLocalhost = Boolean(
   window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(
         /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
);

export default function MainNavigationContainer() {
   const { signIn, signOut } = useAuth();
   const user = useSelector((state) => state.app.user);

   useEffect(() => {
      MainNavigation.setup("main-navigation", {
         onSignInClick: async (event) => {
            event.preventDefault();
            await signIn();
         },
         onSignOutClick: async (event) => {
            event.preventDefault();
            if (isLocalhost) Cookies.set("_loggedIn", "false");
            else Cookies.set("_loggedIn", "false", { domain: "geonorge.no" });
            await signOut();
         },
      });
   }, [user, signIn, signOut]);

   const userinfo = {
      name: user?.name,
      email: user?.email,
   };

   const orginfo = {
      organizationNumber: user?.organizationNumber,
      organizationName: user?.organizationName,
   };

   const mainNavigationProps = {
      userinfo: JSON.stringify(userinfo),
      orginfo: JSON.stringify(orginfo),
      isLoggedIn: !!user,
      environment: environment.ENVIRONMENT,
   };

   return <main-navigation {...mainNavigationProps}></main-navigation>;
}
