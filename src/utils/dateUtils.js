const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export default {
    addMinutes,
    addDays,
};
