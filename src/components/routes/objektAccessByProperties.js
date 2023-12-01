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

    //todo handle value for other datatypes than string?
    var value = document.getElementById('value'+property.Id).value;
    //todo handle input more than one contributor
    var contributors = document.getElementById('contributors'+property.Id).value;

    objektDef.data[0].ForvaltningsObjektPropertiesMetadata[index].AccessByProperties.push
    (
      {
        Id: property.Id,
        Value: value,
        Contributors: [contributors] 
      }
    );

    console.log(objektDef);

    //todo why needed?
    setProperties({title: objekt.title, properties:[
      ...objekt.properties,
      {name: "", dataType: ""}
    ]  
    });
  }

  const removeProperty = (event, index, row) => 
  {
    event.preventDefault();

    console.log(index);

    var deleted = objektDef.data[0].ForvaltningsObjektPropertiesMetadata[index].AccessByProperties.splice(row, 1);
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
    event.persist();

    console.log(event.target.id);

    var event_id = event.target.id.split("-");
    var propertyIndex = event_id[0];
    var accessIndex = event_id[1];

    if(["value", "contributor"].includes(event.target.name))
    {
      if(event.target.name == 'value')
        objektDef.data[0].ForvaltningsObjektPropertiesMetadata[propertyIndex].AccessByProperties[accessIndex].Value = event.target.value;

        if(event.target.name == 'contributor')
          objektDef.data[0].ForvaltningsObjektPropertiesMetadata[propertyIndex].AccessByProperties[accessIndex].Contributors = [event.target.value];
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
      <h1>Egenskapsbaserte-tilgangsrettigheter</h1>
      <form onSubmit={handleEditObject} onChange={handleFieldChange}>

      {objektDef.data ? objektDef.data[0].ForvaltningsObjektPropertiesMetadata.map((property, index) => {
        return (
          <div key={property.Id}>
            <b>{property.Name}</b><br></br>
            {property.AccessByProperties && property.AccessByProperties.map((value, row) => (
              <div>
            <label>Verdi:</label><input type="text" id={index+'-'+row} name="value" defaultValue={value.Value}  />
            <label>Organisasjon:</label><input type="text" id={index+'-'+row} name="contributor" defaultValue={value.Contributors}  />
            <button onClick={e => removeProperty(e, index, row)}>Fjern</button>
            </div>
            ))}
            <label>Verdi:</label><input type="text" id={'value' + property.Id}  />
            <label>Organisasjon:</label><input type="text" id={'contributors' + property.Id}  />
            <button onClick={e => AddProperty(e, property, index)}>Legg til</button>
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
