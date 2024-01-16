import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { setUser } from 'store/slices/appSlice';
import supabase from 'store/services/supabase/client';
import environment from 'config/environment';

export default function AuthProvider({ children }) {
   const [session, setSession] = useState();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const signIn = useCallback(
      async () => {
         await supabase.auth.signInWithOAuth({
            provider: 'keycloak',
            options: {
               scopes: 'openid',
               redirectTo: environment.AUTH_REDIRECT_TO
            }
         });
      },
      []
   );

   const fetchUser = useCallback(
      async session => {
         const { data } = await supabase
            .from('users')
            .select('organization, role')
            .single();

         const { name, email } = session.user.user_metadata;

         dispatch(setUser({ name, email, organization: data.organization }));
      },
      [dispatch]
   );

   async function signOut() {
      await supabase.auth.signOut();
      navigate('/logg-inn', { replace: true });
   }

   useEffect(
      () => {
         history.replaceState('', document.title, window.location.pathname + window.location.search);

         supabase.auth.getSession()
            .then(({ data: { session } }) => {
               setSession(session);
            });

         const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setSession(session);

            if (session !== null) {
               fetchUser(session);
            } else {
               dispatch(setUser(null));
            }
         });

         return () => subscription.unsubscribe();
      },
      [dispatch, fetchUser]
   );

   return (
      <AuthContext.Provider value={{ session, signIn, signOut }}>         
         {children}
      </AuthContext.Provider>
   );
}

export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);