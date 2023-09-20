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

    fetchObject()

  }, [fetchObject]);

  const omittedProps = [];
  //todo problem async?
  console.log(objekt);

    return (
      <>
      {objekt.objekt.map(d => (
        objekt.keys(d).map(prop => (
          !omittedProps.includes(prop) && (
            <tr>
              <td>{d[prop]}</td>
            </tr>
          )
        ))
      ))}
    </>
         
    );
};

export default Objekt;
