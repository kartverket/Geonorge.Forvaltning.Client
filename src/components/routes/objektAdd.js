// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'


// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json} from "react-router-dom";
import config from './config.json';

const ObjektAdd = () => {
  
  const [objekt, setProperties] = useState({title : "", properties: [{name : "", dataType: ""}] });


  const AddProperty = async (event) => {
    event.preventDefault();


    /*var responseSession = await supabase.auth.getSession();
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
      })*/


    //let { props, input } = properties;
    //props.push({ name: "", datatype: "" });
    //this.setState({properties: props});
    //props.push({ name: "", datatype: "" });
    //setProperties({properties : props});
    //setProperties({properties: [... properties, { name: "", datatype: "" }]});
    //setProperties({properties: objekt.properties.concat({ name:  event.target.name.value, datatype: event.target.dataType.value })});
    setProperties({title: objekt.title, properties:[
      ...objekt.properties,
      {name: "", dataType: ""}
    ]  
    });
    console.log("hoy");
  }

  const removeProperty = (event, index) => 
  {
    event.preventDefault();
    console.log(objekt.properties);
    var props = objekt.properties.splice(index, 1);
    setProperties({title: objekt.title, properties : props});
  }

  const handleFieldChange = event => 
  {
    event.preventDefault();

    

    if(["name", "dataType"].includes(event.target.name))
    {
      let properties = [...objekt.properties];
      properties[event.target.id][event.target.name] = event.target.value;
      setProperties({title: objekt.title, properties: properties});
    }
    else
    {
      setProperties({"title": event.target.value, properties: objekt.properties})
    }
    
    console.log(objekt);
  }

  const handleAddObject = async (event) => {
    event.preventDefault();

    var responseSession = await supabase.auth.getSession();

    console.log(objekt)

      var obj = {
        "name": objekt.title,
        "properties": 
          objekt.properties
        };

        console.log(obj);

        // POST request using fetch with error handling
      const requestOptions = {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + responseSession.data.session.access_token,
            'Apikey' :  process.env.REACT_APP_SUPABASE_ANON_KEY
          }),
          body: JSON.stringify(obj)
        };
      fetch(config.apiBaseURL + "/Admin/object", requestOptions)
          .then(async response => {
              const isJson = response.headers.get('content-type')?.includes('application/json');
              const data = isJson && await response.json();
  
              // check for error response
              if (!response.ok) {
                  // get error message from body or default to response status
                  const error = (data && data.message) || response.status;
                  return Promise.reject(error);
              }
  
              console.log(data);
          })
          .catch(error => {
              console.error('There was an error!', error);
          });

  }


  useEffect(() => {

    //setProperties({properties: objekt.properties.concat({ name: "", datatype: "" })});

  }, []);


    return (
      <div>
      <h1>Legg til datasett</h1>
      <form onSubmit={handleAddObject} onChange={handleFieldChange}>
      <label htmlFor="name">Navn:</label>
      <input type="text" name="title"  />
      <br></br>
      <h2>Egenskaper</h2>
      <button onClick={AddProperty}>Legg til egenskap</button>
      {objekt.properties ? objekt.properties.map((property, index) => {
        return (
          <div key={index}>
            <input id={index} placeholder="Name" type="text" name="name" />
            <select id={index} name="dataType">
            <option value="">Velg datatype</option>
              <option value="text">text</option>
              <option value="bool">ja/nei</option>
              <option value="numeric">tall</option>
              <option value="timestamp">dato-tid</option>
            </select>
            <button onClick={e => removeProperty(e, index)}>Fjern</button>
          </div>
        )
      }): null}
      <hr></hr>
      <p>
      <input type="submit" value="Legg til datasett" />
      </p>
      </form>
      </div>  
    );
};

export default ObjektAdd;
