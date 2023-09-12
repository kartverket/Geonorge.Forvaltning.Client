// Dependencies
import React, { Fragment, useState  } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";


const Home = () => {
  
    const handleLogin = async (event) => {
      event.preventDefault()
  
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'keycloak',
        options: {
          scopes: 'openid'
        },
      })
    
      if (error) {
        alert(error.error_description || error.message)
      }

    };
    
    return (
       
           <Fragment>
                <heading-text>
                    <h1 underline="true">Forvaltning </h1>
                </heading-text>
                <p>
                <button onClick={handleLogin}>Logg in</button>
                </p>

            </Fragment>
         
    );
};

export default Home;
