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

  const [user, setUser] = useState(undefined || {});

  const [session, setSession] = useState(undefined || {});

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

  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const csvFileToArray = string => {
    const csvHeader = string.slice(0, string.indexOf("\r\n")).split(";");
    var csvRows = string.slice(string.indexOf("\n") + 1).split("\r\n");
    csvRows = csvRows.slice(0, csvRows.length - 1);

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

  const handleImport = async (event) => {
    event.preventDefault();

    var propName;
    var value;
    var dataType;
    var columnName = '';
    var tableName = objekt.data[0].TableName;

    console.log(tableName);

    array.map( async (item) => {
      var su = '{';

        for(var i = 0; i < objekt.data[0].ForvaltningsObjektPropertiesMetadata.length; i++)
        {
          var o2 = objekt.data[0].ForvaltningsObjektPropertiesMetadata[i];
          if(o2.name !== "id")
          {
            propName = o2.Name;
            dataType = o2.DataType;
            value = item[propName]?.toString()  //event.target[propName].value;
            columnName = o2.ColumnName;
            if(columnName == null)
              columnName = propName;

            console.log(propName + ":" + value);

            if(dataType == "bool" || dataType == "numeric")
            {
              su = su + ' "'+ columnName +'" : '+ value.replace(",", ".") +' ';
            }
            else{
              su = su + ' "'+ columnName +'" : "'+ value +'" ';
            }

            if( i < objekt.data[0].ForvaltningsObjektPropertiesMetadata.length -1)
            {
              su = su + ",";
            }
        }
        }

        console.log(session);

        //su = su  + ' , "geometry" : '+ JSON.stringify(event.target['geometry'].value) +' ';

        su = su  + ' , "owner_org" : "'+ user.data[0].organization +'" ';

        su = su  + ' , "editor" : "'+ session.data.session.user.email +'" ';

        su = su  + ' , "updatedate" : "'+ ((new Date()).toISOString()).toLocaleString('no-NO') +'" ';
        
        su = su + "}";

        console.log(su);

        var insert = JSON.parse(su);
        console.log(insert);

        const { error } = await supabase
        .from(tableName)
        .insert(insert)

        console.log(error);

        if(error == null)
        {
          setShowSuccessDialogBox();
        }
        else
        {
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
        }
        
        console.log(error)
      
      });
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
        <input style={{float: "right"}} type="submit" value="Lagre" onClick={handleImport}/>
        <gn-dialog show={showSuccessDialog} width="" overflow="">
                <body-text>Dataene ble lagt til</body-text>
            </gn-dialog>

            <gn-dialog show={showErrorDialog} width="" overflow="">
                <body-text>{errorMessage}</body-text>
        </gn-dialog>
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
