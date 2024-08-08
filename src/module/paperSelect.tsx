/* eslint-disable react-native/no-inline-styles */
import React, { memo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import {
  TextInput,
  Button,
  Dialog,
  Portal,
  Searchbar,
  ThemeProvider,
  useTheme,
  Text,
} from 'react-native-paper';
import CheckboxInput from '../components/checkBox';
import type {
  ListItem,
  PaperSelectProps,
  PaperSelectTextInputProps,
} from '../interface/paperSelect.interface';
import type { InternalTheme } from 'react-native-paper/lib/typescript/src/types';

const PaperSelect = ({
  // Required props
  label,
  arrayList,
  selectedArrayList,
  multiEnable,
  value,
  onSelection,

  // Core props
  disabled = false,
  hideSearchBox = false,
  selectAllEnable = true,
  textInputMode = 'flat',
  theme: themeOverrides,
  inputRef,
  limit = null,
  limitError = `You can't select more than ${limit} items.`,
  limitErrorStyle,

  // Localization props
  dialogTitle,
  selectAllText = 'Select all',
  searchText = 'Search',
  dialogCloseButtonText = 'Close',
  dialogDoneButtonText = 'Done',
  errorText,

  // Style props
  containerStyle,
  textInputStyle,
  textInputOutlineStyle,
  dialogStyle,
  dialogTitleStyle,
  searchStyle,
  dialogCloseButtonStyle,
  dialogDoneButtonStyle,
  errorStyle,
  textColor,

  // Component props
  textInputProps: textInputPropOverrides,
  checkboxProps: checkboxPropsOverrides,
  searchbarProps: searchbarPropsOverrides,
}: PaperSelectProps) => {
  const theme = useTheme<InternalTheme>(themeOverrides);

  const textInputProps: PaperSelectTextInputProps = {
    underlineColor: textInputPropOverrides?.underlineColor || 'black',
    activeUnderlineColor:
      textInputPropOverrides?.activeUnderlineColor || 'black',
    outlineColor: textInputPropOverrides?.outlineColor || 'black',
    activeOutlineColor: textInputPropOverrides?.activeOutlineColor || 'black',
    left: textInputPropOverrides?.left,
    right: textInputPropOverrides?.right ?? (
      <TextInput.Icon
        style={styles.textInputIcon}
        size={20}
        icon="chevron-down"
      />
    ),
  };

  const { height } = Dimensions.get('window');

  const [searchKey, setSearchKey] = useState<string>('');

  const [arrayHolder, setArrayHolder] = useState<Array<ListItem>>([
    ...arrayList,
  ]);
  const [list, setList] = useState<Array<ListItem>>([...arrayList]);
  const [selectedList, setSelectedList] = useState<Array<ListItem>>([
    ...selectedArrayList,
  ]);

  const [maxLimit, setMaxLimit] = useState<number>(list.length);

  const [hasDisabled, setHasDisabled] = useState<boolean>(false);

  const [showLimitError, setShowLimitError] = useState<boolean>(false);

  const selfInputRef = useRef<any>(null);
  const selectInputRef = inputRef ?? selfInputRef;

  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let _getData = async () => {
      if (isMounted && showLimitError) {
        setTimeout(() => {
          setShowLimitError(false);
        }, 10000);
      }
    };

    _getData();
    return () => {
      isMounted = false;
    };
  }, [showLimitError]);

  const showDialog = () => setVisible(true);

  const _hideDialog = () => {
    setSearchKey('');
    var data: Array<ListItem> = [...arrayHolder];
    // console.log(selectedList);
    var selectedData: Array<ListItem> = [...selectedList];
    // console.log(selectedData);
    let finalText: string = '';
    selectedData.forEach((val, index) => {
      data.forEach((el) => {
        if (val._id === el._id) {
          finalText +=
            index !== selectedData.length - 1 ? `${el.value}, ` : `${el.value}`;
        }
      });
    });

    onSelection({
      text: finalText,
      selectedList: selectedData,
    });

    setVisible(false);

    if (selectInputRef && selectInputRef.current) {
      selectInputRef.current.blur();
    }
  };

  const _closeDialog = () => {
    setVisible(false);
    setSearchKey('');
    if (selectInputRef && selectInputRef.current) {
      selectInputRef.current.blur();
    }
  };

  const _onFocus = () => {
    setArrayHolder([...arrayList]);
    setList([...arrayList]);
    setMaxLimit([...arrayList].length);
    setHasDisabled(_checkIfAnyItemDisabled([...arrayList]));
    setSelectedList([...selectedArrayList]);
    showDialog();
  };

  const _onChecked = (item: any) => {
    let selectedData = [...selectedList];
    const indexSelected = selectedData.findIndex((val) => val._id === item._id);
  
    if (indexSelected > -1) {
      // If the item is already in the selected list, remove it
      selectedData.splice(indexSelected, 1);
    } else {
      // If there's a limit and it is reached, show an error
      if (limit && selectedData.length === limit) {
        setShowLimitError(true);
      } else {
        setShowLimitError(false);
        selectedData.push(item);
        setSearchKey('');
      }
    }
  
    // Update the finalText based on the new selectedData
    const data: Array<ListItem> = [...arrayHolder];
    let finalText: string = '';
  
    selectedData.forEach((val, index) => {
      data.forEach((el) => {
        if (val._id === el._id) {
          finalText += index !== selectedData.length - 1 ? `${el.value}, ` : `${el.value}`;
        }
      });
    });
  
    // Call the onSelection with the updated text and selectedData
    onSelection({
      text: finalText,
      selectedList: selectedData,
    });
  
    // Update the selectedList state
    setSelectedList([...selectedData]);
  };
  

  const _onCheckedSingle = (item: any) => {
    let selectedData = [...selectedList];
    const indexSelected = selectedData.findIndex((val) => val._id === item._id);
  
    if (indexSelected > -1) {
      // If the item is already in the selected list, remove all selections
      selectedData = [];
    } else {
      // If the item is not in the selected list, select only this item
      selectedData = [item];
      setSearchKey('');
    }
  
    const data: Array<ListItem> = [...arrayHolder];
    let finalText: string = '';
    selectedData.forEach((val, index) => {
      data.forEach((el) => {
        if (val._id === el._id) {
          finalText += index !== selectedData.length - 1 ? `${el.value}, ` : `${el.value}`;
        }
      });
    });
  
    onSelection({
      text: finalText,
      selectedList: selectedData,
    });
  
    setSelectedList([...selectedData]);
  };
  

  const _exists = (item: any) => {
    // console.log(selectedList);
    let _temp = [...selectedList];
    return _temp.find((val: any) => val._id === item._id) ? true : false;
  };

  const _isCheckedAll = () => {
    const data = [...list];
    const selectedData = [...selectedList];
    return selectedData.length !== 0 && selectedData.length === data.length;
  };

  const _checkAll = () => {
    const data = [...list];
    var selectedData = [...selectedList];
    if (selectedData.length === data.length) {
      selectedData = [];
    } else if (selectedData.length === 0 || selectedData.length > 0) {
      selectedData = data.slice(0);
    }

    setSelectedList([...selectedData]);
  };

  const _renderItem = ({ item }: { item: ListItem }) => (
    <CheckboxInput
      {...checkboxPropsOverrides}
      isChecked={_exists(item)}
      label={item.value}
      onPress={() => {
        multiEnable === true ? _onChecked(item) : _onCheckedSingle(item);
      }}
      disabled={item.disabled}
    />
  );

  const _filterFunction = (text: string) => {
    setSearchKey(text);
    const newData = arrayHolder.filter((item) =>
      item.value.toLowerCase().includes(text.toLowerCase())
    );
    setList(newData);
  };

  const _checkIfAnyItemDisabled = (_list: Array<ListItem>) => {
    const data = [..._list];
    let result = data.find((x) => x.disabled);
    return result ? true : false;
  };

  return (
    <ThemeProvider theme={theme}>
      <View style={[styles.container, containerStyle]}>
        {/* <TextInput
          {...textInputProps}
          ref={selectInputRef}
          disabled={disabled}
          style={[styles.textInput, textInputStyle]}
          outlineStyle={textInputOutlineStyle}
          label={label}
          mode={textInputMode}
          onFocus={disabled ? undefined : _onFocus}
          showSoftInputOnFocus={false}
          value={value}
          textColor={textColor}
        /> */}
        {errorText ? (
          <Text
            style={[
              {
                color: theme.colors.error,
              },
              errorStyle,
            ]}
          >
            {errorText}
          </Text>
        ) : null}
      </View>

      <View>

              <FlatList
                ListHeaderComponent={
                  multiEnable === true && selectAllEnable === true ? (
                    <CheckboxInput
                      {...checkboxPropsOverrides}
                      isChecked={_isCheckedAll()}
                      label={selectAllText}
                      onPress={() => {
                        _checkAll();
                      }}
                      disabled={
                        hasDisabled ||
                        (limit && limit > 0 && limit !== maxLimit)
                          ? true
                          : false
                      }
                    />
                  ) : null
                }
                data={list}
                renderItem={_renderItem}
                keyExtractor={(item) => item._id.toString()}
                keyboardShouldPersistTaps="handled"
                style={
                  (styles.dialogScrollView,
                  {
                    maxHeight: height - (height * 45) / 100,
                    marginBottom: 8,
                  })
                }
              />
              {showLimitError ? (
                <Text
                  style={[
                    {
                      color: theme.colors.error,
                    },
                    limitErrorStyle,
                  ]}
                >
                  {limitError}
                </Text>
              ) : null}
            {/* <View>
              <Button
                labelStyle={dialogCloseButtonStyle}
                onPress={_closeDialog}
              >
                {dialogCloseButtonText}
              </Button>
              <Button labelStyle={dialogDoneButtonStyle} onPress={_hideDialog}>
                {dialogDoneButtonText}
              </Button>
              </View> */}
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  dialog: {
    borderRadius: 5,
  },
  dialogScrollView: {
    width: '100%',
  },
  textInput: {
    // backgroundColor: '#fff',
    // color: '#000',
  },
  textInputIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
  },
  searchbar: {
    borderColor: '#777777',
    backgroundColor: '#F1F1F2',
    borderWidth: 0.25,
    marginBottom: 10,
    marginHorizontal: 8,
    color: '#000',
    marginTop: 12,
  },
});

export default memo(PaperSelect);
