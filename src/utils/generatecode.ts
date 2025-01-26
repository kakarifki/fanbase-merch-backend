export const generateProductCode = (name:string) => {
    const prefix = name.toLowerCase().replace(/\s+/g, '').substring(0, 7);
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    return `${prefix}-${randomSuffix}`;
}