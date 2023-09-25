// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json} from "react-router-dom";

const ObjektAdd = () => {
  
  const [objekt, setProperties] = useState({title : "", properties: [{name : "", dataType: ""}] });


  const AddProperty = async (event) => {
    event.preventDefault();

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

    console.log(objekt)

    //todo remove test data
     var o = {
      "name": "objektX",
      "properties": [
        {
          "name": "feltY",
          "dataType": "varchar"
        }
      ]
      };

      var obj = {
        "name": objekt.title,
        "properties": 
          objekt.properties
        };

        console.log(obj);

        // POST request using fetch with error handling
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','Authorization': 'Bearer todo' },
          body: JSON.stringify(obj)
        };
      fetch("https://localhost:44390/Admin/object", requestOptions)
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
      <h1>Add objekt</h1>
      <form onSubmit={handleAddObject} onChange={handleFieldChange}>
      <label htmlFor="name">Navn:</label>
      <input type="text" name="title"  />
      <br></br>
      <h2>Properties</h2>
      <button onClick={AddProperty}>Add property</button>
      {objekt.properties ? objekt.properties.map((property, index) => {
        return (
          <div key={index}>
            <input id={index} placeholder="Name" type="text" name="name" />
            <select id={index} name="dataType">
            <option value="">Velg datatype</option>
              <option value="varchar">Varchar</option>
              <option value="bool">bool</option>
            </select>
            <button onClick={e => removeProperty(e, index)}>Remove</button>
          </div>
        )
      }): null}
      <hr></hr>
      <p>
      <input type="submit" value="Add objekt" />
      </p>
      </form>
      </div>  
    );
};

export default ObjektAdd;
