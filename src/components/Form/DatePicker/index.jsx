import { forwardRef, useRef, useState } from 'react';
import { getTimeZone } from 'config/date';
import { isNil } from 'lodash';
import { hasError } from '../helpers';
import ReactDatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import styles from './DatePicker.module.scss';
import commonStyles from '../Form.module.scss';

export default function DatePicker({ id, name, label, value, onChange, error, errorMessage, className = '' }) {
   const initDate = !isNil(value) && value !== '' ? new Date(value) : null;
   const [_value, setValue] = useState(initDate);
   const originalDateRef = useRef(initDate);
   const datePickerRef = useRef(null);

   function handleChange(date, event) {
      if (event) {
         event.preventDefault();
         event.stopPropagation()
      }

      const _date = dayjs(date);
      const newDay = dayjs([_date.year(), _date.month(), _date.date(), _date.hour(), _date.minute()]).tz(getTimeZone());

      setValue(newDay.toDate());
   }

   function handleYearChange(date) {
      const year = dayjs(date).year();
      const day = dayjs(_value || new Date()).year(year);

      setValue(day.toDate());
   }

   function handleMonthChange(date) {
      const month = dayjs(date).month();
      const day = dayjs(_value || new Date()).month(month);

      setValue(day.toDate());
   }

   function handleClear() {
      setValue(null);
      onChange({ target: { name, value: null } });
   }

   function save() {
      originalDateRef.current = _value;
      onChange({ target: { name, value: dayjs(_value).format() } });
      datePickerRef.current.setOpen(false);
   }

   function cancel() {
      setValue(originalDateRef.current);
      onChange({ name, value });
      datePickerRef.current.setOpen(false);
   }

   return (
      <ReactDatePicker
         ref={datePickerRef}
         name={name}
         value={_value}
         selected={_value}
         onChange={handleChange}
         onYearChange={handleYearChange}
         onMonthChange={handleMonthChange}
         showTimeSelect
         showMonthDropdown
         showYearDropdown
         dropdownMode="select"
         dateFormat="dd.MM.yyyy 'kl.' HH:mm"
         timeFormat="HH:mm"
         timeIntervals={1}
         locale="nb"
         shouldCloseOnSelect={false}
         onClickOutside={cancel}
         portalId="datepicker-portal"
         className={className}
         customInput={
            <DatePickerInput
               inputId={id}
               label={label}
               error={error}
               errorMessage={errorMessage}
               onClear={handleClear}
            />
         }
      >
         <div className={styles.buttonRow}>
            <gn-button>
               <button onClick={cancel}>Avbryt</button>
            </gn-button>

            <gn-button>
               <button onClick={save} disabled={_value === null}>OK</button>
            </gn-button>
         </div>
      </ReactDatePicker>
   );
}

const DatePickerInput = forwardRef(({ inputId, value, label, onChange, onClick, onClear, error, errorMessage }, ref) => (
   <div className={styles.inputContainer}>
      {
         label ?
            <gn-label block="">
               <label htmlFor={inputId}>{label}</label>
            </gn-label> :
            null
      }
      <div className={styles.input}>
         <gn-input block="" width="">
            <input
               id={inputId}
               ref={ref}
               type="text"
               value={value}
               onChange={onChange}
               onClick={onClick}
               readOnly
            />
         </gn-input>

         <button onClick={onClear}></button>
      </div>
      {
         hasError(error) ?
            <div className={commonStyles.error}>{errorMessage}</div> :
            null
      }
   </div>
));

DatePickerInput.displayName = 'DatePickerInput';