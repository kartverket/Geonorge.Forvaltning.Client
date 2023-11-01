// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'
import config from './config.json';

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, useParams} from "react-router-dom";

const ObjektDataImportGeoJson = () => {

  const { id } = useParams();
  
  const [file, setFile] = useState();
  const [geoJson, setGeoJson] = useState();
  const [objekt, setObject] = useState([]);
  const [preview, setPreview] = useState(false);

  const [user, setUser] = useState(undefined || {});

  const [session, setSession] = useState(undefined || {});

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const [mapping, setMapping] = useState([]);


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

  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const getGeoJSON = string => {

    var json = JSON.parse(string);
    setGeoJson(json);
    console.log(json);

  };


  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        getGeoJSON(text);
      };

      fileReader.readAsText(file);
    }
  };


  const updateMapping = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    var name = e.target.value;
    
    for(var i = 0; i < mapping.length; i++)
    {
      if(mapping[i].startsWith(name))
      {
          mapping.splice(i, 1);
      }
    }

    if(name.includes(':') && !mapping.includes(name))
    {
      mapping.push(name);
    }

    console.log(mapping);
    setMapping(mapping);

  };

  const handlePreview = async (event) => {
    event.preventDefault();
    setPreview(true);

  }


  const fetchObject = async (event) => {
    await supabase
    .from('ForvaltningsObjektMetadata')
    .select(`
    Id, Organization,Name, TableName,
    ForvaltningsObjektPropertiesMetadata (
      Id,Name,DataType, ColumnName
    )`).eq('Id', id)
  .then((res) => setObject(res))
   .catch((err => console.log(err)))

    console.log(objekt);


  }
  const fetchUser = async () => {

    await supabase.from('users')
    .select('organization,role')
    .then((res) => { setUser(res); console.log(res);})
    .catch((err => console.log(err)))
  
    supabase.auth.getSession().then((res) => { setSession(res) })
    .catch((err => console.log(err)))
  
  }

 



  useEffect(() => {

    fetchObject();
    fetchUser();

  }, []);


  return (
    <div style={{ textAlign: "center" }}>
      <Link to={`/`}>Hovedside</Link>&nbsp;
      <Link to={`/objekt/${id}`}>Tilbake</Link>
      <h1>Importer data</h1>
      <form>
        <input
          type={"file"}
          id={"geoJSONFileInput"}
          accept={".geojson"}
          onChange={handleOnChange}
        />

        <button
          onClick={(e) => {
            handleOnSubmit(e);
          }}
        >
          Importer geojson
        </button>
        <input style={{float: "right"}} type="submit" value="Lagre" />
        <gn-dialog show={showSuccessDialog} width="" overflow="">
                <body-text>Dataene ble lagt til</body-text>
            </gn-dialog>

            <gn-dialog show={showErrorDialog} width="" overflow="">
                <body-text>{errorMessage}</body-text>
        </gn-dialog>
      </form>

      <br />
      <h1>{objekt.data && objekt.data[0].Name}</h1>
      <p>Velg geojson fil:</p>
      <table border="1">
      <thead> 
      </thead>
      <tbody>
      {geoJson && Object.keys(geoJson.features[0].properties).map((key, i) => (
          <tr key={i}>
            <td>{key}</td>
            <td><select name={key} onChange={(event) => updateMapping(event)}>
            <option value={key}>Ikke mappet</option>
            {objekt.data !== undefined && objekt.data[0].ForvaltningsObjektPropertiesMetadata.map(d => 
              <option key={d.Name} value={key +':'+ d.Name}>{d.Name}</option>
          )}
          </select>
          </td>
          </tr>
       ))
      } 

    {geoJson &&
      (
        <tr><td>geometry</td><td>geometry</td></tr>
      )
      }  
      {geoJson &&
      (
        <tr><td></td><td><button onClick={handlePreview}>Forhåndsvis</button></td></tr>
      )
      }      
      </tbody>
    </table>

    {preview && 
    (
      <table border="1">
      <thead> 
      <tr>{mapping.map(d => 
              <th>{d.split(':')[1]}</th>
          )}</tr>
      </thead>
      <tbody>
      <tr>{mapping.map(d => 
              <td>{geoJson.features[0].properties[d.split(':')[0]]}</td>
          )}</tr>
      </tbody>
      </table>
    )
    }

    </div>
  );
}

export default ObjektDataImportGeoJson;
