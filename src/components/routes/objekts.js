// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'
import config from './config.json';

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link} from "react-router-dom";

const Objekts = () => {
  
  const [objekts, setObjects] = useState([])

  const fetchObjects = async () => {

    var responseSession = await supabase.auth.getSession();
    console.log("access_token: " + responseSession.data.session.access_token);
    console.log("ANON_KEY: "+process.env.REACT_APP_SUPABASE_ANON_KEY);

    fetch(config.apiBaseURL + "/Admin/objects", { 
      method: 'get', 
      headers: new Headers({
        'Authorization' : 'Bearer ' + responseSession.data.session.access_token,
        'Apikey' :  process.env.REACT_APP_SUPABASE_ANON_KEY
      })
    })
      .then(response => {
        return response.json()
      })
      .then(data => {
        setObjects(data)
      })
  }


  useEffect(() => {

    fetchObjects()

  }, []);

  const omittedProps = ["id"];

    return (
      <>
      <div>
      <Link to={`/objekt/add`}>Add object</Link>
      </div>
      <hr></hr>
      {objekts.map(d => (
        Object.keys(d).map(prop => (
          !omittedProps.includes(prop) && (
            <div key={d.id}>
              <Link to={`/objekt/${d.id}`}>{d[prop]}</Link>
            </div>
          )
        ))
      ))}
    </>
         
    );
};

export default Objekts;
