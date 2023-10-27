// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'


// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json, useParams} from "react-router-dom";
import config from './config.json';

const ObjektEdit = () => {
  
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

  const AddProperty = async (event) => {
    event.preventDefault();

    objektDef.data[0].ForvaltningsObjektPropertiesMetadata.push({Id: 0, Name: '', DataType: ''})

    console.log(objektDef);

    setProperties({title: objekt.title, properties:[
      ...objekt.properties,
      {name: "", dataType: ""}
    ]  
    });
  }

  const removeProperty = (event, index) => 
  {
    event.preventDefault();

    console.log(index);

    var deleted = objektDef.data[0].ForvaltningsObjektPropertiesMetadata.splice(index, 1);
    console.log(deleted);
    console.log(objektDef);
    setObjektDef(objektDef);
    console.log(objektDef);

    //console.log(objekt.properties);
    var props = objekt.properties;//.splice(index, 1);
    setProperties({title: objekt.title, properties : props});
  }

  const handleFieldChange = event => 
  {
    event.preventDefault();

    

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
    else
    {
      //setProperties({"title": event.target.value, properties: objekt.properties})
      objektDef.data[0].Name = event.target.value;
    }
    
    console.log(objektDef);
  }

  const handleEditObject = async (event) => {
    event.preventDefault();

    var responseSession = await supabase.auth.getSession();

    console.log(objektDef)

      var obj = {
        "name": objektDef.data[0].Name,
        "properties": 
          objektDef.data[0].ForvaltningsObjektPropertiesMetadata
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
    Id, Organization,Name,
    ForvaltningsObjektPropertiesMetadata (
      Id,Name,DataType
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
        <Link to={`/objekt/${objektDef.data[0].Id}`}>{objektDef.data[0].Name}</Link>
        )}
      <h1>Rediger datasett</h1>
      <form onSubmit={handleEditObject} onChange={handleFieldChange}>
      <label htmlFor="name">Navn:</label>
      <input type="text" name="title" id="name" defaultValue={objektDef.data && objektDef.data[0].Name}  />
      <br></br>
      <h2>Egenskaper</h2>
      <button onClick={AddProperty}>Legg til egenskap</button>
      {objektDef.data ? objektDef.data[0].ForvaltningsObjektPropertiesMetadata.map((property, index) => {
        return (
          <div key={index}>
            <input placeholder="Name" type="text" name="name" defaultValue={property.Name} />
            <select name="dataType" defaultValue={property.DataType}>
            <option value="">Velg datatype</option>
              <option value="text">text</option>
              <option value="bool">ja/nei</option>
              <option value="numeric" >tall</option>
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
      <gn-dialog show={showSuccessDialog} width="" overflow="">
                <body-text>Datasettet ble endret!</body-text>
            </gn-dialog>

            <gn-dialog show={showErrorDialog} width="" overflow="">
                <body-text>{errorMessage}</body-text>
      </gn-dialog>
      </div>  
    );
};

export default ObjektEdit;
