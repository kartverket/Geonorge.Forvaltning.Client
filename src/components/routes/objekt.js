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

  var tabellNavn = null;

  const [tableName, setTableName] = useState('');


  const getDataResult = async (metadataInfo)  => {

    const data = {
      definition: metadataInfo,
      objects: null,
      
    };
        
    console.log(metadataInfo);
    tabellNavn = metadataInfo.data[0].TableName;
    var properties = metadataInfo.data[0].ForvaltningsObjektPropertiesMetadata;

    var props = [];

    properties.forEach(obj => {
      props.push(obj.ColumnName);
    });

    var columns = 'id,' + props.join(",") + ', geometry';
    console.log(columns);

    console.log(tabellNavn);
    const { dataTable, errorData } = await supabase
    .from(tabellNavn)
    .select(columns).then((res) => data.objects = res)

    setTableName(tabellNavn);

    return data;

    };


  const fetchObject = async (event) => {
    var metaAndData = null;
    await supabase
    .from('ForvaltningsObjektMetadata')
    .select(`
    Id, Organization,Name, TableName,
    ForvaltningsObjektPropertiesMetadata (
      Id,Name,DataType, ColumnName
    )`).eq('Id', id)
  .then((res) => getDataResult(res))
   .then((finalResult) => {console.log(finalResult); setObject(finalResult); })
   .catch((err => console.log(err)))

    console.log(objekt);

  }

  const removeItem = async (event, id) => 
  {
    event.preventDefault();
    const { errorDelete } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
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
      <tr><th colSpan={objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata.length + 3}>{objekt.definition.data[0].Name}</th></tr>
      )}
      <tr>
      <th>id</th>
      {objekt.definition !== undefined && objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata.map(d => 
              <th key={d.Name}>{d.Name}</th>
          )
      }
      <th>geometry</th>
      <th></th>
      </tr>
      </thead>
      <tbody>
      {objekt.objects !== undefined && objekt.objects.data.map((d, index) => (  
            <>
            <tr data-index={index}>
              <td>{d.id}</td>
              {objekt.definition !== undefined && objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata.map(d2 => 
              <td key={d2.ColumnName}>{d[d2.ColumnName].toString()}</td>
              )
            }
            <td>{JSON.stringify(d.geometry)}</td>
            <td><input type="button" value="Slett" onClick={e => removeItem(e, d.id)} /></td>
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
