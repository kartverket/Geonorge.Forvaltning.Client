// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import Cookies from 'universal-cookie';


const Home = () => {
  
  const [loggedIn, setLoggedIn] = useState(false);

  const cookies = useMemo(() => new Cookies(), []);

  cookies.set("loggedIn", cookies.get('loggedIn'));

  const handleLogin = async (event) => {
    event.preventDefault()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'keycloak',
      options: {
        scopes: 'openid'
      },
    })

    console.log(data);
  
    if (error) {
      alert(error.error_description || error.message)
    }
    else
    {
      cookies.set("loggedIn", true);
      setLoggedIn(true);
    }

  };

  const handleLogout = async (event) => {
    event.preventDefault()

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error:" + error);
    }
    cookies.set("loggedIn", false);
    setLoggedIn(false);
  }

  const handleTestQyery = async (event) => {
    event.preventDefault()

    var responseSession = await supabase.auth.getSession();
    console.log(responseSession);
    console.log("access_token: " + responseSession.data.session.access_token);

    const response = await supabase.from('bensinstasjoner').select()
 
    console.log(response);
    
    var table = 'bensinstasjoner';
    var json = { navn: 'Esso Tiger Tromsø', merke: 'Esso', bensin: true };
    
    const { error } = await supabase
    .from(table)
    .insert(json)
    
    console.log(error)

  }

  useEffect(() => {

    setLoggedIn(cookies.get('loggedIn'))

  }, [loggedIn, cookies]);

    return (
       
           <Fragment>
                <heading-text>
                    <h1 underline="true">Forvaltning </h1>
                </heading-text>
                {!loggedIn &&
                <p>
                <button onClick={handleLogin}>Logg in</button>
                </p>
                }
                {loggedIn &&
                <div>
                  <p>
                  <button onClick={handleTestQyery}>Test query</button>
                  </p>
                  <p>
                  <button onClick={handleLogout}>Logg ut</button>
                  </p>
                </div>
                }

            </Fragment>
         
    );
};

export default Home;
