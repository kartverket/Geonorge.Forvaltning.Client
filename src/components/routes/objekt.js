// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, useParams} from "react-router-dom";

const Objekt = () => {
  
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


  useEffect(() => {

    fetchObject();

  }, []);

  const omittedProps = [];
  var counter = 0;
  
  //todo Error: Objects are not valid as a React child (found: object with keys {type, coordinates})
  //first solution: api return object as string

    return (
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
      {objekt.objekt !== undefined && objekt.objekt.map(d => (
        Object.keys(d).map(prop => (
          !omittedProps.includes(prop) && (
            <>
            <tr>
              <td key={d.id}>{d[prop].toString()}</td>
            </tr>
            </>
          )
        ))
      ))}
      </tbody>
    </table>
         
    );
};

export default Objekt;
