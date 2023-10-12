// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'
import config from './config.json';

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import Cookies from 'universal-cookie';
import {Link} from "react-router-dom";


const Home = () => {

  const [objekts, setObjects] = useState(undefined || {});
  
  const [loggedIn, setLoggedIn] = useState(false);

  const [user, setUser] = useState(undefined || {});

  const [info, setInfo] = useState('');

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

  const handleAuth = async (event) => {
    event.preventDefault()

    var responseSession = await supabase.auth.getSession();
    console.log("access_token: " + responseSession.data.session.access_token);
    console.log("ANON_KEY: "+process.env.REACT_APP_SUPABASE_ANON_KEY);

    await fetch(config.apiBaseURL + "/Admin/authorize-request", { 
      method: 'post', 
      headers: new Headers({
        'Authorization' : 'Bearer ' + responseSession.data.session.access_token,
        'Apikey' :  process.env.REACT_APP_SUPABASE_ANON_KEY
      })
    }).then((res) => { setInfo('Beskjed sendt'); console.log(res);})
    .catch((err => console.log(err)))
  
  }

  const fetchObjects = async () => {

      await supabase.from('ForvaltningsObjektMetadata')
      .select('Id ,Name')
      .then((res) => { setObjects(res); console.log(res);})
      .catch((err => console.log(err)))
  }

  const test = async () => {

    await supabase.from('t_22')
    .select('c_1,geometry')
    .then((res) => { console.log(JSON.stringify(res.data[0].geometry));})
    .catch((err => console.log(err)))
}

  const fetchUser = async () => {

    await supabase.from('users')
    .select('organization,role')
    .then((res) => { setUser(res); console.log(res);})
    .catch((err => console.log(err)))
}

  useEffect(() => {

    setLoggedIn(cookies.get('loggedIn'))
    fetchObjects();
    fetchUser();
    test();

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

                {user && user.data && user.data.length == 0  &&
                <p><button onClick={handleAuth}>Send forespørsel autorisasjon</button>
                <span>{info}</span>
                </p>
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
