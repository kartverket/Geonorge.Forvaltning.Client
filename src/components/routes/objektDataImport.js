// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'
import config from './config.json';

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, useParams} from "react-router-dom";

const ObjektDataImport = () => {

  const { id } = useParams();
  
  const [file, setFile] = useState();
  const [array, setArray] = useState([]);
  const [objekt, setObject] = useState([]);

  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const csvFileToArray = string => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(";");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map(i => {
      const values = i.split(";");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    setArray(array);
    console.log(array);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
    }
  };

  const headerKeys = Object.keys(Object.assign({}, ...array));

  const fetchObject = async (event) => {
    var metaAndData = null;
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

  useEffect(() => {

    fetchObject();

  }, []);


  return (
    <div style={{ textAlign: "center" }}>
      <Link to={`/`}>Hovedside</Link>&nbsp;
      <Link to={`/objekt/${id}`}>Tilbake</Link>
      <h1>Importer data</h1>
      <form>
        <input
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />

        <button
          onClick={(e) => {
            handleOnSubmit(e);
          }}
        >
          Importer CSV
        </button>
        <input style={{float: "right"}} type="submit" value="Lagre"/>
      </form>

      <br />
      <h1>{objekt.data && objekt.data[0].Name}</h1>
      <p>Velg fil med følgende kolonneoverskrifter:</p>
      <table border="1">
      <thead>
      <tr>
      {objekt.data !== undefined && objekt.data[0].ForvaltningsObjektPropertiesMetadata.map(d => 
              <th key={d.Name}>{d.Name}</th>
          )
      }
      <th>geometry</th>
      </tr>
      </thead>
      <tbody>
      {array.map((item) => (
            <tr key={item.id}>
              {Object.values(item).map((val) => (
                <td>{val}</td>
              ))}
            </tr>
          ))}  
      </tbody>
    </table>
    </div>
  );
}

export default ObjektDataImport;
