import { forwardRef, useEffect, useRef, useState } from 'react';
import { isFunction, orderBy } from 'lodash';
import { hasError } from '../helpers';
import TagsInput from 'react-tagsinput';
import styles from '../Controllers.module.scss';

const Tags = forwardRef(({ id, field, fieldState, validator, formatTag, placeholder, errorMessage, className }, ref) => {
   const [tags, setTags] = useState(field.value);

   function handleChange(tags) {
      const _tags = orderBy(tags, tag => tag.toLowerCase());
      setTags(_tags);
      field.onChange({ target: { name: field.name, value: _tags } });
   }

   function _formatTag(tag) {
      return isFunction(formatTag) ?
         formatTag(tag) :
         tag;
   }

   return (
      <TagsInput
         value={tags}
         onChange={handleChange}
         validate={validator}
         renderInput={props => {
            const { onChange, value, addTag, ...other } = props;

            return (
               <gn-input block="">
                  <input id={id} ref={ref} type="text" value={value} onChange={onChange} {...other} placeholder={placeholder} />
               </gn-input>
            );
         }}
         renderTag={props => {
            const { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props;
            
            return (
               <span key={key} {...other} className={styles.tag}>
                  {_formatTag(tag)}
                  {
                     !disabled && <button onClick={() => onRemove(key)}></button>
                  }
               </span>
            );
         }}
         renderLayout={(tagElements, inputElement) => {
            return (
               <div className={styles.tagsInput}>
                  <div className={styles.inputElement}>
                     {inputElement}
                     {
                        hasError(fieldState.error) ?
                           <div className={styles.error}>{errorMessage}</div> :
                           null
                     }
                  </div>
                  <div className={styles.tags}>
                     {tagElements}
                  </div>
               </div>
            );
         }}
         pasteSplit={data => data.split(',').map(value => value.trim())}
         addOnPaste={true}
         removeKeys={[]}
         onlyUnique={true}
         className={className}
      />
   );
});

Tags.displayName = 'Tags';

export default Tags;