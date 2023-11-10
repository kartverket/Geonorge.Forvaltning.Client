// Dependencies
import React, { Fragment, useState, useEffect, useMemo   } from "react";
import { supabase } from './supabaseClient'


// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";
import {Link, json,useParams} from "react-router-dom";
import config from './config.json';

const ObjektAccessByProperties = () => {
  
  const { id } = useParams();

  useEffect(() => {


  }, []);


    return (
      <div>Todo {id}</div>
     
    );
};

export default ObjektAccessByProperties;
