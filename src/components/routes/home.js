// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import Cookies from 'universal-cookie';
import {Link} from "react-router-dom";


const Home = () => {

  const [objekts, setObjects] = useState(undefined || {});
  
  const [loggedIn, setLoggedIn] = useState(false);

  const cookies = useMemo(() => new Cookies(), []);

  cookies.set("loggedIn", cookies.get('loggedIn'));

  const handleLogin = async (event) => {
    event.preventDefault()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'keycloak',
      options: {
        scopes: 'openid'
       , redirectTo: process.env.REACT_APP_REDIRECT_TO
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

  const fetchObjects = async () => {

      await supabase.from('ForvaltningsObjektMetadata')
      .select('Id ,Name')
      .then((res) => { setObjects(res); console.log(res);})
      .catch((err => console.log(err)))
  }

  useEffect(() => {

    setLoggedIn(cookies.get('loggedIn'))
    fetchObjects();

  }, [loggedIn, cookies]);

    return (
       
           <Fragment>
                <heading-text>
                    <h1 underline="true">Forvaltning </h1>
                </heading-text>
                {!loggedIn &&
                <p>
                <button onClick={handleLogin}>Logg inn</button>
                </p>
                }
                {loggedIn &&
                <div>

                <div>
                <Link to={`/objekt/add`}>Legg til datasett</Link>
                </div>
                <h3>Datasett</h3>
                {objekts && objekts.data && objekts.data.map((objekt) => (
                      <div key={objekt.Id}>
                        <Link to={`/objekt/${objekt.Id}`}>{objekt.Name}</Link>
                      </div>
                    )
                  )
                }
                <hr></hr>
                <div>
                  <p>
                  <button onClick={handleLogout}>Logg ut</button>
                  </p>
                </div>
                </div>
                }

            </Fragment>
         
    );
};

export default Home;
