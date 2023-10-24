// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'


// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json, useParams} from "react-router-dom";
import config from './config.json';

const ObjektEdit = () => {
  
  const [objekt, setProperties] = useState({title : "", properties: [{name : "", dataType: ""}] });

  const [objektDef, setObjektDef] = useState(undefined || {});

  const { id } = useParams();

  const AddProperty = async (event) => {
    event.preventDefault();


    setProperties({title: objekt.title, properties:[
      ...objekt.properties,
      {name: "", dataType: ""}
    ]  
    });
  }

  const AddProperties = async () => {

    console.log(objektDef);
    objektDef.data[0].ForvaltningsObjektPropertiesMetadata.forEach(element => {
      setProperties({title: element.title, properties:[
        ...objekt.properties,
        {name: element.Name, dataType: ""}
      ]  
      });
    });
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

  const handleEditObject = async (event) => {
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
          method: 'PUT',
          headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + responseSession.data.session.access_token,
            'Apikey' :  process.env.REACT_APP_SUPABASE_ANON_KEY
          }),
          body: JSON.stringify(obj)
        };
      fetch(config.apiBaseURL + "/Admin/object/" + id, requestOptions)
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

  const fetchObject = async (event) => {
    await supabase
    .from('ForvaltningsObjektMetadata')
    .select(`
    Id, Organization,Name, TableName,
    ForvaltningsObjektPropertiesMetadata (
      Id,Name,DataType, ColumnName
    )`).eq('Id', id)
  .then((res) => {setObjektDef(res); console.log(res);})
  .catch((err => console.log(err)))

    console.log(objektDef);

  }   


  useEffect(() => {

    fetchObject();
    setTimeout(() => {
      AddProperties();
    }, 4000);

  }, []);


    return (
      <div>
      <h1>Rediger datasett</h1>
      <form onSubmit={handleEditObject} onChange={handleFieldChange}>
      <label htmlFor="name">Navn:</label>
      <input type="text" name="title" value={objektDef.data && objektDef.data[0].Name}  />
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
      <input type="submit" value="Rediger datasett" />
      </p>
      </form>
      </div>  
    );
};

export default ObjektEdit;
