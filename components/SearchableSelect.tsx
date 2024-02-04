"use client"
import React, {useEffect, useState} from 'react';

import CreatableSelect from 'react-select/creatable';

interface Option {
    readonly label: string;
    readonly value: string;
}

interface Props {
    inputOptions: string[]
    onSelect: (value: string) => void
    defaultValue?: string
}

const createOption = (label: string) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, ''),
});


export const SearchableSelect = ({inputOptions, onSelect, defaultValue}: Props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<Option[]>(inputOptions.map(createOption));
    const [value, setValue] = useState<Option | null>(defaultValue && createOption(defaultValue));
    useEffect(() => {
        setOptions(inputOptions.map(createOption))
    }, [inputOptions])
    // Filter out duplicates initially
    useEffect(() => {
        const filteredOptions = options.reduce<Option[]>((acc, option) => {
            const isDuplicate = acc.some(existingOption => existingOption.value === option.value);
            if (!isDuplicate) {
                acc.push(option);
            }
            return acc;
        }, []);
        // console.log(filteredOptions);
        setOptions(filteredOptions);
    }, []);

    const handleCreate = (inputValue: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const newOption = createOption(inputValue);
            setIsLoading(false);
            setOptions((prev) => [...prev, newOption]);
            setValue(newOption);
            onSelect(newOption.label);
        }, 300);
    };


    const handleOnChange = (value: Option) => {
        setValue(value);
        onSelect(value?.label)
    }

    return (
        <CreatableSelect
            form='submit'
            className='text-sm'
            placeholder={"Select Category..."}
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={handleOnChange}
            onCreateOption={handleCreate}
            options={options}
            value={value}
        />
    );
};
