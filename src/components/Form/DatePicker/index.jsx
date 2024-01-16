import { forwardRef, useRef, useState } from 'react';
import { getTimeZone } from 'config/date';
import ReactDatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import styles from './DatePicker.module.scss';

export default function DatePicker({ name, value, onChange }) {
   const initDate = value !== null ? new Date(value) : null;
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
      onChange({ name, value: null });
   }

   function save() {
      originalDateRef.current = _value;
      onChange({ name, value: dayjs(_value).format() });
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
         customInput={<DatePickerInput onClear={handleClear} />}
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
   )
}

const DatePickerInput = forwardRef(({ value, onChange, onClick, onClear }, ref) => (
   <div className={styles.inputContainer}>
      <gn-input block="">
         <input
            type="text"
            value={value}
            onChange={onChange}
            onClick={onClick}
            ref={ref}
            readOnly
         />
      </gn-input>

      <button onClick={onClear}></button>
   </div>
));

DatePickerInput.displayName = 'DatePickerInput';