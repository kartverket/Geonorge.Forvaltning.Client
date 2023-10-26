// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'


// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json, useParams} from "react-router-dom";
import config from './config.json';

const ObjektDelete = () => {

  const [objektDef, setObjektDef] = useState(undefined || {});

  const { id } = useParams();

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const setShowSuccessDialogBox = () => {
    setShowSuccessDialog(false);
    setTimeout(() => {
        setShowSuccessDialog(true);
    });
  };

  const showDialogErrorBox = () => {
      setShowErrorDialog(false);
      setTimeout(() => {
          setShowErrorDialog(true);
      });
  };

  const handleDeleteObject = async (event) => {
    event.preventDefault();

    var responseSession = await supabase.auth.getSession();

        // POST request using fetch with error handling
      const requestOptions = {
          method: 'DELETE',
          headers: new Headers({
            'Authorization' : 'Bearer ' + responseSession.data.session.access_token,
            'Apikey' :  process.env.REACT_APP_SUPABASE_ANON_KEY
          }),
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
              setShowSuccessDialogBox();
          })
          .catch(error => {
            showDialogErrorBox();
  
            if (error.response?.data) {
                const messages = Object.values(error.response.data).map((value) => value.join(", "));
                setErrorMessage(messages.join("\r\n"));
            }
            else if (error?.message) 
            { 
              setErrorMessage(error.message);
            }
            else {
                setErrorMessage(error);
            }
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

  }, []);


    return (
      <div>
      <h1>Slett datasett</h1>
      <Link to={`/`}>Hovedside</Link>&nbsp;
      {objektDef.data !== undefined && (
        <Link to={`/objekt/${objektDef.data[0].Id}`}>{objektDef.data[0].Name}</Link>
        )}
      <form onSubmit={handleDeleteObject}>
      <b>Navn:</b>
      <span>{objektDef.data && objektDef.data[0].Name}</span>
      <p>
      <input type="submit" value="Slett datasett" />
      </p>
      </form>
      <gn-dialog show={showSuccessDialog} width="" overflow="">
                <body-text>Datasettet ble slettet!</body-text>
            </gn-dialog>

            <gn-dialog show={showErrorDialog} width="" overflow="">
                <body-text>{errorMessage}</body-text>
      </gn-dialog>
      </div>  
    );
};

export default ObjektDelete;
