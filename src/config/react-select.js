export const customTheme = base => ({
   ...base,
   borderRadius: 4,
   colors: {
      ...base.colors,
      primary: '#000000',
      primary50: '#dddddd'
   }
});

export const customStyles = {
   control: base => ({
      ...base,
      height: 32,
      minHeight: 32,
      color: '#000000'
   }),
   valueContainer: base => ({
      ...base,
      padding: '0 8px'
   }),
   clearIndicator: base => ({
      ...base,
      padding: '4px 8px'
   }),
   dropdownIndicator: base => ({
      ...base,
      padding: '4px 8px'
   }),
   multiValue: base => ({
      ...base,
      backgroundColor: '#eeeeee',
      ':hover': {
         backgroundColor: '#dddddd'
      },
      '>div:first-of-type': {
         padding: '2px 3px 2px 6px'
      }

   }),
   multiValueRemove: base => ({
      ...base,
      cursor: 'pointer',
      ':hover': {
         backgroundColor: 'none'
      }
   }),
   menu: base => ({
      ...base,
      border: 'none',
      boxShadow: '0 3px 7px rgba(0, 0, 0, 0.133), 0 0.6px 2px rgba(0, 0, 0, 0.1)'
   }),
   option: (base, state) => ({
      ...base,
      color: '#000000',
      backgroundColor: state.isFocused && 'rgba(0, 0, 0, .05)',
      padding: '6px 12px',
      ':hover': {
         backgroundColor: 'rgba(0, 0, 0, .05)'
      }
   }),
   noOptionsMessage: base => ({
      ...base,
      textAlign: 'left'
   }),
   loadingMessage: base => ({
      ...base,
      textAlign: 'left'
   })
};
