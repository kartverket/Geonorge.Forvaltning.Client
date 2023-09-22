// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, useParams} from "react-router-dom";

const ObjektDataAdd = () => {
  
  const [objekt, setObject] = useState([]);

  const { id } = useParams();

  const fetchObject = () => {
    fetch("https://localhost:44390/Admin/object/" + id)
      .then(response => {
        return response.json()
      })
      .then(data => {
        setObject(data)
      })
  }

  const handleAddObject = async (event) => {
    event.preventDefault();

    var o = '{"objekt":{';
    var propName;
    var value;
    var dataType;


      for(var i = 0; i < objekt.definition.properties.length; i++)
      {
        var o2 = objekt.definition.properties[i];
        if(o2.name !== "id")
        {
          propName = o2.name;
          dataType = o2.dataType;
          value = event.target[propName].value;

          console.log(propName + ":" + value);

          if(dataType == "bool")
          {
            o = o + ' "'+ propName +'" : '+ value +' ';
          }
          else if(dataType == "geometry")
          {
            o = o + ' "'+ propName +'" : '+ JSON.stringify(value) +' '; //Todo handle geometry
          }
          else{
            o = o + ' "'+ propName +'" : "'+ value +'" ';
          }

          if( i < objekt.definition.properties.length -1)
          {
            o = o + ",";
          }
      }
      }

      o = o + "}}";


        // POST request using fetch with error handling
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','Authorization': 'Bearer todo' },
          body: o
        };
      fetch("https://localhost:44390/Admin/object/" + id, requestOptions)
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

    fetchObject();

  }, []);

  const omittedProps = ["id"];
  var counter = 0;
  
  //todo Error: Objects are not valid as a React child (found: object with keys {type, coordinates})
  //first solution: api return object as string

    return (
      <form onSubmit={handleAddObject}>

      {objekt.definition !== undefined && (
      <h1>Add data to {objekt.definition.name}</h1>
      )}

      {objekt.definition !== undefined && objekt.definition.properties.map(d =>
        d.name !== "id" && (
            <div> 
              <label for={d.name}>{d.name}<span>:</span></label>
              {d.dataType == "varchar" && (
                <input type="text" name={d.name}></input>
              )}
              {d.dataType == "bool" && (
                <span>
                  <span>Ja</span><input type="radio" name={d.name} value="true"></input>
                  <span>Nei</span><input type="radio" name={d.name} value="false"></input>
                </span>
              )}
              {d.dataType == "geometry" && (
                <span>
                  <textarea name={d.name}></textarea>
                </span>
              )}
            </div>
          )
        )
      }
    <p>
    <input type="submit" value="Add data" />
    </p>
    </form>
         
    );
};

export default ObjektDataAdd;
