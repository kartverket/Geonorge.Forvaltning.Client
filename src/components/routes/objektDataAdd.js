// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'
import config from './config.json';

// openlayers
import GeoJSON from 'ol/format/GeoJSON'

// components
import MapWrapper from './mapWrapper'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, useParams} from "react-router-dom";

const ObjektDataAdd = () => {
  
  const [objekt, setObject] = useState([]);

  const { id } = useParams();

  const [ features, setFeatures ] = useState([])

  const [selectedCoord, setSelectedCoord] = useState("Velg koordinater i kart");

  const handleCoordinateSelected = (transormedCoord) => {
    console.log(transormedCoord);
    setSelectedCoord('{"type": "Point", "coordinates": ['+ transormedCoord[0] +', '+ transormedCoord[1] +']}');
 }


  const fetchObject = () => {
    fetch(config.apiBaseURL + "/Admin/object/" + id)
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
    var columnName = '';
    var tableName = objekt.definition.tableName;

    console.log(tableName);

    var su = '{';

      for(var i = 0; i < objekt.definition.properties.length; i++)
      {
        var o2 = objekt.definition.properties[i];
        if(o2.name !== "id")
        {
          propName = o2.name;
          dataType = o2.dataType;
          value = event.target[propName].value;
          columnName = o2.columnName;
          if(columnName == null)
            columnName = propName;

          console.log(propName + ":" + value);

          if(dataType == "bool" || dataType == "numeric")
          {
            o = o + ' "'+ propName +'" : '+ value +' ';
            su = su + ' "'+ columnName +'" : '+ value +' ';
          }
          else if(dataType == "geometry")
          {
            o = o + ' "'+ propName +'" : '+ JSON.stringify(value) +' '; //Todo handle geometry
            su = su  + ' "'+ columnName +'" : '+ JSON.stringify(value) +' '; //Todo handle geometry
          }
          else{
            o = o + ' "'+ propName +'" : "'+ value +'" ';
            su = su + ' "'+ columnName +'" : "'+ value +'" ';
          }

          if( i < objekt.definition.properties.length -1)
          {
            o = o + ",";
            su = su + ",";
          }
      }
      }

      o = o + "}}";
      su = su + "}";

      var forSupabase = JSON.parse(su);
      console.log(forSupabase);

        // POST request using fetch with error handling
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','Authorization': 'Bearer todo' },
          body: o
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


  useEffect(() => {

    fetchObject();

  }, []);

  
  //todo Error: Objects are not valid as a React child (found: object with keys {type, coordinates})
  //first solution: api return object as string

    return (
      <form onSubmit={handleAddObject}>
      {objekt.definition !== undefined && (
      <h1>Add data to {objekt.definition.name}</h1>
      )}
        <p>
        <input type="submit" value="Save" />
        </p>
      {objekt.definition !== undefined && objekt.definition.properties.map(d =>
        d.name !== "id" && (
            <div key={d.name}> 
              <label htmlFor={d.name}>{d.name}<span>:</span></label>
              {d.dataType == "text" && (
                <input type="text" name={d.name}></input>
              )}
              {d.dataType == "numeric" && (
                <input type="number" step="0.01" name={d.name}></input>
              )}
              {d.dataType == "datetime" && (
                <input type="datetime-local" name={d.name}></input>
              )}
              {d.dataType == "bool" && (
                <span >
                  <span>Ja</span><input type="radio" name={d.name} value="true"></input>
                  <span>Nei</span><input type="radio" name={d.name} value="false"></input>
                </span>
              )}
              {d.dataType == "geometry" && (
                <span>
                  <textarea name={d.name} value={selectedCoord}></textarea>
                  <div><MapWrapper features={features} handleCoordinateSelected={handleCoordinateSelected} /></div>
                </span>
              )}
            </div>
          )
        )
      }
    </form>
         
    );
};

export default ObjektDataAdd;
