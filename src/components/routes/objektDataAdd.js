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

  const [user, setUser] = useState(undefined || {});

  const handleCoordinateSelected = (transormedCoord) => {
    console.log(transormedCoord);
    setSelectedCoord('{"type": "Point", "coordinates": ['+ transormedCoord[0] +', '+ transormedCoord[1] +']}');
 }

 const fetchUser = async () => {

  await supabase.from('users')
  .select('organization,role')
  .then((res) => { setUser(res); console.log(res);})
  .catch((err => console.log(err)))
}

 const getDataResult = async (metadataInfo)  => {

  const data = {
    definition: metadataInfo,
    objects: null,
    
  };
      
  console.log(metadataInfo);
  var tabellNavn = metadataInfo.data[0].TableName;
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

  const handleAddObject = async (event) => {
    event.preventDefault();

    var propName;
    var value;
    var dataType;
    var columnName = '';
    var tableName = objekt.definition.data[0].TableName;

    console.log(tableName);

    var su = '{';

      for(var i = 0; i < objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata.length; i++)
      {
        var o2 = objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata[i];
        if(o2.name !== "id")
        {
          propName = o2.Name;
          dataType = o2.DataType;
          value = event.target[propName].value;
          columnName = o2.ColumnName;
          if(columnName == null)
            columnName = propName;

          console.log(propName + ":" + value);

          if(dataType == "bool" || dataType == "numeric")
          {
            su = su + ' "'+ columnName +'" : '+ value +' ';
          }
          else{
            su = su + ' "'+ columnName +'" : "'+ value +'" ';
          }

          if( i < objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata.length -1)
          {
            su = su + ",";
          }
      }
      }

      console.log(user);

      su = su  + ' , "geometry" : '+ JSON.stringify(event.target['geometry'].value) +' '; //Todo handle geometry

      su = su  + ' , "owner_org" : "'+ user.data[0].organization +'" ';
      
      //todo updatedate and editor

      su = su + "}";

      console.log(su);

      var insert = JSON.parse(su);
      console.log(insert);

      const { error } = await supabase
      .from(tableName)
      .insert(insert)
      
      console.log(error)

      //todo handle update
      /*var json = { navn:'Navn1'};
      var idUpdate=10;
      const { errorUpdate } = await supabase
      .from(tableName)
      .update(json)
      .eq('id', idUpdate); */

  }


  useEffect(() => {

    fetchObject();
    fetchUser();

  }, []);


    return (
      <form onSubmit={handleAddObject}>
        <Link to={`/`}>Hovedside</Link>&nbsp;
        {objekt.definition !== undefined && (
        <Link to={`/objekt/${objekt.definition.data[0].Id}`}>{objekt.definition.data[0].Name}</Link>
        )}
      {objekt.definition !== undefined && (
      <h1>Add data to {objekt.definition.data[0].Name}</h1>
      )}
        <p>
        <input type="submit" value="Save" />
        </p>
      {objekt.definition !== undefined && objekt.definition.data[0].ForvaltningsObjektPropertiesMetadata.map(d =>
        d.Name !== "id" && (
            <div key={d.Name}> 
              <label htmlFor={d.Name}>{d.Name}<span>:</span></label>
              {d.DataType == "text" && (
                <input type="text" name={d.Name}></input>
              )}
              {d.DataType == "numeric" && (
                <input type="number" step="0.01" name={d.Name}></input>
              )}
              {d.DataType == "timestamp" && (
                <input type="datetime-local" name={d.Name}></input>
              )}
              {d.DataType == "bool" && (
                <span >
                  <span>Ja</span><input type="radio" name={d.Name} value="true"></input>
                  <span>Nei</span><input type="radio" name={d.Name} value="false"></input>
                </span>
              )}
            </div>
          )
        )
      }
      <div>
          <span>
            <textarea name="geometry" value={selectedCoord}></textarea>
            <div><MapWrapper features={features} handleCoordinateSelected={handleCoordinateSelected} /></div>
          </span>
      </div>
    </form>
         
    );
};

export default ObjektDataAdd;
