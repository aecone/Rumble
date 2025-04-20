import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const DropDownPicker = ({
  items = [],
  value,
  setValue,
  open,
  setOpen,
  placeholder,
}) => {
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text>{value || placeholder || 'Select an option'}</Text>
      </TouchableOpacity>
      {open && (
        <View>
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => {
                setValue(item.value);
                setOpen(false);
              }}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default DropDownPicker;