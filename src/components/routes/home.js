// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import Cookies from 'universal-cookie';
import {Link} from "react-router-dom";


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
       // , redirectTo: 'https://localhost:44389' // use if not site url in supabase
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


    //todo create policy for table ForvaltningsObjektMetadata and ForvaltningsObjektPropertiesMetadata column Organization
    const { metadata, errorMetadata } = await supabase
    .from('ForvaltningsObjektMetadata')
    .select(`
    Id, Organization,Name, TableName,
    ForvaltningsObjektPropertiesMetadata (
      Id,Name,DataType, ColumnName
    )`).eq('Id', '19');

    console.log(metadata);
    
    //Todo error timing undefined?
    var tabellNavn = metadata[0].TableName;

    const { dataTable, errorData } = await supabase
    .from(tabellNavn)
    .select();

    console.log(dataTable);

    var responseSession = await supabase.auth.getSession();
    console.log(responseSession);
    console.log("access_token: " + responseSession.data.session.access_token);

    var userId = responseSession.data.session.user.id;

    const responseUser = await supabase.from('users').select().eq('id', userId);
    console.log(responseUser);
    var owner =  responseUser.data[0].organization;
    console.log('Eier:' + owner);

    console.log(responseUser);


    const response = await supabase.from('bensinstasjoner').select()
 
    console.log(response);
    
    var table = 'bensinstasjoner';
    var json = { navn: 'Esso Tiger Tromsø', merke: 'Esso', bensin: true, owner_org: owner };
    
    const { error } = await supabase
    .from(table)
    .insert(json)
    
    console.log(error)

    json = { navn: 'Esso Tiger Tromsø2'};
    var idUpdate = 10;
    const { errorUpdate } = await supabase
    .from(table)
    .update(json)
    .eq('id', idUpdate)

    console.log(errorUpdate)

    var idDelete = 11;

    const { errorDelete } = await supabase
    .from(table)
    .delete()
    .eq('id', idDelete)

    console.log(errorDelete);

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
                  <Link to="/objekts"> Objekts </Link>
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
