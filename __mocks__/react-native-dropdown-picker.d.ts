declare module 'react-native-dropdown-picker' {
    import React from 'react';
  
    export interface DropDownPickerProps {
      open: boolean;
      setOpen: (open: boolean) => void;
      value: any;
      setValue: (callback: (val: any) => any) => void;
      items: { label: string; value: any }[];
      placeholder?: string;
      // Add any other props your code uses
    }
  
    const DropDownPicker: React.FC<DropDownPickerProps>;
    export default DropDownPicker;
  }
  