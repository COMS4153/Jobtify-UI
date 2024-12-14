export const filterBySearchTerm = (items, searchTerm, fields) => {
    if (!searchTerm.trim()) return items;

    const terms = searchTerm.toLowerCase().split(' ').filter(term => term);

    return items.filter(item => {
        return terms.every(term => {
            return fields.some(field => {
                const value = item[field] ? item[field].toString().toLowerCase() : '';
                return value.includes(term);
            });
        });
    });
};
