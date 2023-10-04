// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'
import config from './config.json';

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, useParams} from "react-router-dom";

const Objekt = () => {
  
  const [objekt, setObject] = useState([]);

  const { id } = useParams();

  const fetchObject = () => {
    fetch(config.apiBaseURL + "/Admin/object/" + id)
      .then(response => {
        return response.json()
      })
      .then(data => {
        setObject(data)
      })
  }


  useEffect(() => {

    fetchObject();

  }, []);

  const omittedProps = [];
  var counter = 0;
  
  //todo Error: Objects are not valid as a React child (found: object with keys {type, coordinates})
  //first solution: api return object as string

    return (
      <div>
      <Link to={`/objekt/${id}/adddata`}>Add data</Link>
      <table border="1">
      <thead>
      {objekt.definition !== undefined && (
      <tr><th colSpan={objekt.definition.properties.length}>{objekt.definition.name}</th></tr>
      )}
      <tr>
      {objekt.definition !== undefined && objekt.definition.properties.map(d => 
              <th key={d.name}>{d.name}</th>
          )
      }
      </tr>
      </thead>
      <tbody>
      {objekt.objekt !== undefined && objekt.objekt.map((d, index) => (  
            <>
            <tr data-index={index}>
              {objekt.definition !== undefined && objekt.definition.properties.map(d2 => 
              <td key={d2.name}>{d[d2.name].toString()}</td>
              )
            }
            </tr>
            </>
          )
        
      )}
      </tbody>
    </table>
    </div>    
    );
};

export default Objekt;
