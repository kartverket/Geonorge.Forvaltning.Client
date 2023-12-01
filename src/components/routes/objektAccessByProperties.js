// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'


// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json,useParams} from "react-router-dom";
import config from './config.json';

const ObjektAccessByProperties = () => {
  
  //todo remove objekt, not in use, but kept otherwise add and remove not updating UI???
  const [objekt, setProperties] = useState({title : "", properties: [{name : "", dataType: ""}] });

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

  const AddProperty = async (event, property, index) => {
    event.preventDefault();

    //todo
  }

  const removeProperty = (event, index) => 
  {
    event.preventDefault();

    //todo

  }

  const handleFieldChange = event => 
  {
    event.persist();

    

    if(["name", "dataType"].includes(event.target.name))
    {
      //let properties = [...objekt.properties];
      //properties[event.target.id][event.target.name] = event.target.value;
      //setProperties({title: objekt.title, properties: properties});
      if(event.target.name == 'name')
        objektDef.data[0].ForvaltningsObjektPropertiesMetadata[event.target.id].Name = event.target.value;

        if(event.target.name == 'dataType')
        objektDef.data[0].ForvaltningsObjektPropertiesMetadata[event.target.id].DataType = event.target.value;
    }
    else if (["title","description", "isopendata"].includes(event.target.name))
    {
      if(event.target.name == 'title')
        objektDef.data[0].Name = event.target.value;

      if(event.target.name == 'description')
        objektDef.data[0].Description = event.target.value;

      if(event.target.name == 'isopendata')
      {
          objektDef.data[0].IsOpenData = event.target.checked;
      }

        console.log(objektDef.data[0].IsOpenData);
    }
    
    var newObjekt = Object.create(objektDef);
    setObjektDef(newObjekt);

    console.log(event);
  }



  const handleEditObject = async (event) => {
    event.preventDefault();

    var responseSession = await supabase.auth.getSession();

    console.log(objektDef)

    var access = [];
    
    objektDef.data[0].ForvaltningsObjektPropertiesMetadata.map((property, index) => {
  
      if(property.AccessByProperties && property.AccessByProperties.length > 0)
      {
        for(var a = 0; a < property.AccessByProperties.length; a++)
        {
          access.push(
            { 
              "PropertyId": property.Id,
              "Value": property.AccessByProperties[a].Value,
              "Contributors": property.AccessByProperties[a].Contributors 
            }
          );
        }
      }
    
    });

      var obj = {
        "objekt": id,
        "AccessByProperties": access
        };

        console.log(obj);

        //return;

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
      fetch(config.apiBaseURL + "/Admin/access-by-properties", requestOptions)
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

  const fetchObject = async () => {
    await supabase
    .from('ForvaltningsObjektMetadata')
    .select(`
    Id, Organization,Name,Description,IsOpenData, srid, Contributors,
    ForvaltningsObjektPropertiesMetadata (
      Id,Name,DataType,AllowedValues, AccessByProperties (
        Id,Value,Contributors
      )
    )`).eq('Id', id)
  .then((res) => 
  {
    console.log(res); setObjektDef(res); 
  })
  .catch((err => console.log(err)))

  }   


  useEffect(() => {

    fetchObject();

  }, []);


    return (
      <div>
        <Link to={`/`}>Hovedside</Link>&nbsp;
        {objektDef.data !== undefined && (
        <Link to={`/objekt/${id}/edit`}>Tilbake</Link>
        )}
      <h1>Egenskapsbaserte tilgangsrettigheter</h1>
      <h2>todo page under construction</h2>
      <form onSubmit={handleEditObject} onChange={handleFieldChange}>

      {objektDef.data ? objektDef.data[0].ForvaltningsObjektPropertiesMetadata.map((property, index) => {
        return (
          <div key={property.Id}>
            <b>{property.Name}</b><br></br>
            <button onClick={e => AddProperty(e, property, index)}>Legg til</button>
            {property.AccessByProperties && property.AccessByProperties.map((value, row) => (
              <div>
            <label>Verdi:</label><input type="text" name="value" defaultValue={value.Value}  />
            <label>Organisasjon:</label><input type="text" name="contributor" defaultValue={value.Contributors}  />
            <button onClick={e => removeProperty(e, index)}>Fjern</button>
            </div>
            ))}
          </div>
        )
      }): null}
      <hr></hr>
      <p>
      <input type="submit" value="Rediger" />
      </p>
      </form>
      <gn-dialog show={showSuccessDialog} width="" overflow="">
                <body-text>Datasettet ble endret!</body-text>
            </gn-dialog>

            <gn-dialog show={showErrorDialog} width="" overflow="">
                <body-text>{errorMessage}</body-text>
      </gn-dialog>
      </div>  
    );
};

export default ObjektAccessByProperties;
