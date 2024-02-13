import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { inPlaceSort } from 'fast-sort';
import { isFunction } from 'lodash';
import { hasError } from '../helpers';
import styles from '../Form.module.scss';
import './Tags.scss';

const Tags = forwardRef(({ id, name, value, onChange, error, validator, formatTag, placeholder, unique = true, sort = true, errorMessage, className = '' }, ref) => {
   const [tagInput, setTagInput] = useState('');
   const [formattedTags, setFormattedTags] = useState([]);
   const tagsRef = useRef(value);

   function getRandomId() {
      return Math.random().toString(36).replace(/[^a-z]+/g, '');
   }

   const formatTags = useCallback(
      async tags => {
         const formattedTags = [];

         for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];

            const formatted = isFunction(formatTag) ?
               await formatTag(tag) :
               tag;

            formattedTags.push({ value: tag, format: formatted });
         }

         setFormattedTags(formattedTags);
      },
      [formatTag]
   );

   useEffect(
      () => {
         (async () => {
            await formatTags(value);
         })();
      },
      [value, formatTags]
   );

   function handlePaste(event) {
      event.preventDefault();

      if (!event.clipboardData) {
         return;
      }

      const text = event.clipboardData.getData('text/plain');
      setTagInput(text);
      addTag(text);
   }

   function handleKeyDown(event) {
      if (event.key === 'Enter') {
         addTag(tagInput);
      }
   }

   async function addTag(text) {
      let values = text.split(',').map(value => value.trim());

      if (unique) {
         values = values.filter(value => !tagsRef.current.includes(value));
      }

      if (isFunction(validator)) {
         values = await validateTags(values);
      }

      const updatedTags = [...tagsRef.current, ...values];

      if (sort) {
         inPlaceSort(updatedTags).asc();
      }

      tagsRef.current = updatedTags;
      await formatTags(updatedTags);
      setTagInput('');

      onChange({ target: { name, value: updatedTags } });
   }

   async function validateTags(tags) {
      const validTags = [];

      for (let i = 0; i < tags.length; i++) {
         const tag = tags[i];

         if (validator(tag)) {
            validTags.push(tag);
         }
      }

      return validTags;
   }

   function deleteTag(index) {
      const formatted = [...formattedTags];
      formatted.splice(index, 1);

      setFormattedTags(formatted);
      tagsRef.current.splice(index, 1);

      onChange({ target: { name, value: tagsRef.current } });
   }

   return (
      <div className={`tagsinput ${className}`}>
         <div className="tagsinput-input">
            <gn-input block="">
               <input
                  id={id}
                  ref={ref}
                  type="text"
                  name={getRandomId()}
                  value={tagInput}
                  onChange={event => setTagInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={placeholder}
               />
            </gn-input>
            {
               hasError(error) ?
                  <div className={styles.error}>{errorMessage}</div> :
                  null
            }
         </div>
         {
            formattedTags.length > 0 ?
               <div className="tagsinput-tags">
                  {
                     formattedTags.map((tag, index) => (
                        <div key={tag.value} className="tagsinput-tag">
                           {tag.format}
                           <button onClick={() => deleteTag(index)}></button>
                        </div>
                     ))
                  }
               </div> :
               null
         }
      </div>
   );
});

Tags.displayName = 'Tags';

export default Tags;