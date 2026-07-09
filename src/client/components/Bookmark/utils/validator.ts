export type ValidationResult = {
    valid: boolean;
    error?: string;
}

export const isValidString = (value: unknown): value is string => typeof value === 'string';
export const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);
export const isValidArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const validateItemField = (
    item: any,
    field: string,
    validator: (value: unknown) => boolean,
    errorMessage: string
): ValidationResult => {
    if (!validator(item[field])) {
        return { valid: false, error: errorMessage };
    }
    return { valid: true };
}

export const validateItem = (item: any, index: number): ValidationResult => {
    const validations: ValidationResult[] = [
        validateItemField(item, 'id', isValidNumber, `Item ${index}: missing valid id`),
        validateItemField(item, 'title', isValidString, `Item ${index}: missing valid title`),
        validateItemField(item, 'artists', isValidArray, `Item ${index}: missing artists array`),
        validateItemField(item, 'groups', isValidArray, `Item ${index}: missing groups array`),
        validateItemField(item, 'type', isValidString, `Item ${index}: missing valid type`),
        validateItemField(item, 'series', isValidArray, `Item ${index}: missing series array`),
        validateItemField(item, 'characters', isValidArray, `Item ${index}: missing characters array`),
        validateItemField(item, 'tags', isValidArray, `Item ${index}: missing tags array`),
        validateItemField(item, 'date', isValidString, `Item ${index}: missing valid date`),
    ];

    // Special case: language can be null or string
    if (item.language !== null && !isValidString(item.language)) {
        return { valid: false, error: `Item ${index}: has invalid language` };
    }

    const failedValidation = validations.find(v => !v.valid);
    return failedValidation || { valid: true };
}

export const validateBookmarkStructure = (data: any): ValidationResult => {
    if (!('name' in data)) {
        return { valid: false, error: "No name found." };
    }

    if (!isValidNumber(data.date) || data.date <= 0) {
        return { valid: false, error: "No valid date found." };
    }

    if (!('items' in data) || !isValidArray(data.items)) {
        return { valid: false, error: "No items found." };
    }

    return { valid: true };
}

export const validateBookmarkData = (data: unknown): ValidationResult => {
    if (!isValidString(data)) {
        return { valid: false, error: "File is not correct string type." };
    }

    let parsedJSON: any;
    try {
        parsedJSON = JSON.parse(data);
    } catch {
        return { valid: false, error: "File is not a valid JSON." };
    }

    const structureValidation = validateBookmarkStructure(parsedJSON);
    if (!structureValidation.valid) {
        return structureValidation;
    }

    // Validate all items in the array
    for (let i = 0; i < parsedJSON.items.length; i++) {
        const itemValidation = validateItem(parsedJSON.items[i], i + 1);
        if (!itemValidation.valid) {
            return itemValidation;
        }
    }

    return { valid: true };
}
